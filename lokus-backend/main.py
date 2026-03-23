import asyncio
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import models
from database import engine, get_db, SessionLocal

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lokus State Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# BACKGROUND WORKER (Cart & Temporal Engine)
# ==========================================
async def sweep_expired_carts():
    """Manages Cart integrity and Temporal Drop Windows."""
    while True:
        await asyncio.sleep(10)  # Check every 10 seconds
        db = SessionLocal()
        try:
            now = datetime.now(timezone.utc)
            
            # 1. SWEEP EXPIRED CARTS
            expired_reservations = db.query(models.Reservation).filter(
                models.Reservation.status == models.ReservationState.RESERVED,
            ).all()
            
            for res in expired_reservations:
                # Timezone fix for SQLite
                expire_time = res.expires_at.replace(tzinfo=timezone.utc) if res.expires_at.tzinfo is None else res.expires_at
                
                if expire_time <= now:
                    res.status = models.ReservationState.EXPIRED
                    shoe = db.query(models.Product).filter(models.Product.id == res.shoe_id).first()
                    if shoe:
                        shoe.available_stock += 1
                        if shoe.status == models.ProductState.SOLD_OUT and (not shoe.drop_end or shoe.drop_end.replace(tzinfo=timezone.utc) > now):
                            shoe.status = models.ProductState.LIVE
                            print(f"RESTOCK ALERT: {shoe.model_name} is back in the pool!")
            
            # 2. TEMPORAL STATE SCHEDULER
            upcoming_shoes = db.query(models.Product).filter(models.Product.status == models.ProductState.UPCOMING).all()
            for shoe in upcoming_shoes:
                if shoe.drop_start and shoe.drop_start.replace(tzinfo=timezone.utc) <= now:
                    shoe.status = models.ProductState.LIVE
                    print(f"DROP LIVE: {shoe.model_name} is now available!")

            live_shoes = db.query(models.Product).filter(models.Product.status == models.ProductState.LIVE).all()
            for shoe in live_shoes:
                if shoe.drop_end and shoe.drop_end.replace(tzinfo=timezone.utc) <= now:
                    shoe.status = models.ProductState.SOLD_OUT
                    print(f"DROP ENDED: {shoe.model_name} window closed.")

            db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(sweep_expired_carts())


# ==========================================
# PUBLIC STOREFRONT ROUTES
# ==========================================
@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    if db.query(models.Product).count() == 0:
        shoe1 = models.Product(
            brand="Nike", model_name="Travis Scott Jordan 1", colorway="Mocha", price_inr=85000, 
            image_url="https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=500&q=80", 
            total_stock=5, available_stock=5, status=models.ProductState.LIVE, is_hyped_drop=True
        )
        shoe2 = models.Product(
            brand="Yeezy", model_name="Boost 350 V2", colorway="Zebra", price_inr=22000, 
            image_url="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", 
            total_stock=10, available_stock=10, status=models.ProductState.LIVE, is_hyped_drop=False
        )
        db.add_all([shoe1, shoe2])
        db.commit()
        return {"message": "Database seeded!"}
    return {"message": "Database already contains data."}

@app.get("/api/v1/drops")
def get_live_drops(db: Session = Depends(get_db)):
    live_shoes = db.query(models.Product).filter(models.Product.status == models.ProductState.LIVE).all()
    return {"live_drops": live_shoes}

@app.get("/api/v1/upcoming")
def get_upcoming_drops(db: Session = Depends(get_db)):
    upcoming_shoes = db.query(models.Product).filter(
        models.Product.status == models.ProductState.UPCOMING,
        models.Product.drop_start.isnot(None)
    ).order_by(models.Product.drop_start.asc()).all()
    return {"upcoming_drops": upcoming_shoes}


# ==========================================
# TRANSACTION ORCHESTRATOR & CHECKOUT
# ==========================================
@app.post("/api/v1/reserve")
def reserve_shoe(user_id: int, shoe_id: int, db: Session = Depends(get_db)):
    try:
        shoe = db.query(models.Product).filter(models.Product.id == shoe_id).with_for_update().first()
        if not shoe: raise HTTPException(status_code=404, detail="Shoe not found.")
        if shoe.status != models.ProductState.LIVE: raise HTTPException(status_code=400, detail="Shoe is not currently live.")
        if shoe.available_stock <= 0: raise HTTPException(status_code=409, detail="Constraint Failed: Out of Stock")

        # Dynamic Constraint: Anti-Hoarding for Hyped Drops
        if shoe.is_hyped_drop:
            existing_res = db.query(models.Reservation).filter(
                models.Reservation.user_id == user_id, models.Reservation.shoe_id == shoe_id,
                models.Reservation.status == models.ReservationState.RESERVED
            ).first()
            existing_order = db.query(models.Order).filter(models.Order.user_id == user_id, models.Order.shoe_id == shoe_id).first()
            
            if existing_res or existing_order:
                raise HTTPException(status_code=403, detail="Constraint Active: Strictly 1 pair per customer for Hyped Drops.")

        shoe.available_stock -= 1
        if shoe.available_stock == 0: shoe.status = models.ProductState.SOLD_OUT
            
        timer_minutes = 1 if shoe.is_hyped_drop else 15
        expiration_time = datetime.now(timezone.utc) + timedelta(minutes=timer_minutes)
        
        new_reservation = models.Reservation(user_id=user_id, shoe_id=shoe_id, status=models.ReservationState.RESERVED, expires_at=expiration_time)
        db.add(new_reservation)
        db.commit()
        db.refresh(new_reservation)
        
        return {"message": "Secured!", "reservation_id": new_reservation.id, "expires_at": new_reservation.expires_at}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"Engine Error: {str(e)}")

@app.get("/api/v1/reservations/{res_id}")
def get_reservation_details(res_id: int, db: Session = Depends(get_db)):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res: raise HTTPException(status_code=404, detail="Reservation not found")
    shoe = db.query(models.Product).filter(models.Product.id == res.shoe_id).first()
    return {"reservation": res, "shoe": shoe}

class CheckoutRequest(BaseModel):
    size: str

@app.post("/api/v1/checkout/{res_id}")
def complete_checkout(res_id: int, req: CheckoutRequest, db: Session = Depends(get_db)):
    try:
        res = db.query(models.Reservation).filter(models.Reservation.id == res_id).with_for_update().first()
        if not res or res.status != models.ReservationState.RESERVED:
            raise HTTPException(status_code=400, detail="Cart is no longer valid or has expired.")
            
        expire_time = res.expires_at.replace(tzinfo=timezone.utc) if res.expires_at.tzinfo is None else res.expires_at
        if expire_time <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Time limit exceeded. Cart expired.")

        res.status = models.ReservationState.PURCHASED
        new_order = models.Order(
            user_id=res.user_id, shoe_id=res.shoe_id, reservation_id=res.id, size=req.size,
            status=models.OrderState.PENDING_VERIFICATION
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {"message": "Transaction Complete!", "order_id": new_order.id}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/users/{user_id}/orders")
def get_user_vault(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    order_history = [{
        "order_id": o.id, "status": o.status, "size": o.size,
        "shoe": {"brand": o.shoe.brand, "model_name": o.shoe.model_name, "image_url": o.shoe.image_url, "price_inr": o.shoe.price_inr}
    } for o in orders]
    return {"order_history": order_history}


# ==========================================
# ADMIN DASHBOARD & STRICT PIPELINE
# ==========================================
VALID_TRANSITIONS = {
    models.OrderState.PENDING_VERIFICATION: [models.OrderState.AUTHENTICATED, models.OrderState.CANCELLED],
    models.OrderState.AUTHENTICATED: [models.OrderState.SHIPPED],
    models.OrderState.SHIPPED: [models.OrderState.DELIVERED],
    models.OrderState.DELIVERED: [],
    models.OrderState.CANCELLED: []
}

class StateTransitionRequest(BaseModel):
    new_state: models.OrderState

class ProductCreate(BaseModel):
    brand: str
    model_name: str
    colorway: str
    price_inr: int
    image_url: str
    total_stock: int
    delay_minutes: int = 0      
    duration_hours: int = 24

@app.get("/api/v1/admin/stats")
def get_system_stats(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    return {
        "total_shoes_tracked": db.query(models.Product).count(),
        "active_locks": db.query(models.Reservation).filter(models.Reservation.status == models.ReservationState.RESERVED).count(),
        "expired_violators": db.query(models.Reservation).filter(models.Reservation.status == models.ReservationState.RESERVED, models.Reservation.expires_at <= now).count(),
        "sold_out_count": db.query(models.Product).filter(models.Product.status == models.ProductState.SOLD_OUT).count()
    }

@app.post("/api/v1/admin/force-sweep")
def force_sweep_carts(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    swept_count = 0
    restocked = []
    try:
        expired = db.query(models.Reservation).filter(models.Reservation.status == models.ReservationState.RESERVED).all()
        for res in expired:
            expire_time = res.expires_at.replace(tzinfo=timezone.utc) if res.expires_at.tzinfo is None else res.expires_at
            if expire_time <= now:
                res.status = models.ReservationState.EXPIRED
                swept_count += 1
                shoe = db.query(models.Product).filter(models.Product.id == res.shoe_id).first()
                if shoe:
                    shoe.available_stock += 1
                    if shoe.status == models.ProductState.SOLD_OUT and (not shoe.drop_end or shoe.drop_end.replace(tzinfo=timezone.utc) > now):
                        shoe.status = models.ProductState.LIVE
                    if shoe.model_name not in restocked: restocked.append(shoe.model_name)
        db.commit()
        return {"message": "Sweep Complete", "swept_count": swept_count, "restocked": restocked}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/admin/products")
def add_new_product(product: ProductCreate, db: Session = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc)
        start_time = now + timedelta(minutes=product.delay_minutes)
        end_time = start_time + timedelta(hours=product.duration_hours)
        initial_status = models.ProductState.UPCOMING if product.delay_minutes > 0 else models.ProductState.LIVE

        new_product = models.Product(
            brand=product.brand, model_name=product.model_name, colorway=product.colorway, price_inr=product.price_inr,
            image_url=product.image_url, total_stock=product.total_stock, available_stock=product.total_stock,
            status=initial_status, is_hyped_drop=True, drop_start=start_time, drop_end=end_time
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return {"message": "Product injected!", "product_id": new_product.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/admin/orders")
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    pipeline = [{
        "order_id": o.id, "shoe": o.shoe.model_name, "size": o.size, "current_state": o.status,
        "allowed_next_states": VALID_TRANSITIONS.get(o.status, [])
    } for o in orders]
    return {"orders": pipeline}

@app.post("/api/v1/admin/orders/{order_id}/transition")
def transition_order_state(order_id: int, req: StateTransitionRequest, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    
    allowed_states = VALID_TRANSITIONS.get(order.status, [])
    if req.new_state not in allowed_states:
        raise HTTPException(status_code=400, detail=f"Illegal State Transition. Cannot move from {order.status} to {req.new_state}.")

    order.status = req.new_state
    db.commit()
    return {"message": "State Transition Successful", "new_state": order.status}    