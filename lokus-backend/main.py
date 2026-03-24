import asyncio
import random
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

import models
from database import engine, get_db, SessionLocal

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Lokus State Engine & API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# WEBSOCKET MANAGER
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try: await connection.send_json(message)
            except: pass

manager = ConnectionManager()

@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==========================================
# EMAIL & AUTH CONFIG
# ==========================================
SENDER_EMAIL = "baburaoo1500@gmail.com" 
SENDER_APP_PASSWORD = "yqgugwuxcnodnckc"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

class UserRegisterInitiate(BaseModel):
    name: str
    email: EmailStr
    role: str
    address: str
    pincode: str
    password: str

class UserVerify(BaseModel):
    email: EmailStr
    code: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def hash_password(password: str) -> str: return hashlib.sha256(password.encode()).hexdigest()
def verify_password(plain_password: str, hashed_password: str) -> bool: return hash_password(plain_password) == hashed_password
def generate_verification_code() -> str: return str(random.randint(100000, 999999))

def send_verification_email(receiver_email: str, code: str):
    try:
        message = MIMEMultipart()
        message["From"], message["To"], message["Subject"] = SENDER_EMAIL, receiver_email, "Lokus. - Verify Your Account"
        html = f"""<div style="background:#1c1917; padding:30px; color:#fff; text-align:center;">
                   <h1>Lokus.</h1><div style="background:#292524; padding:20px; font-size:32px;">{code}</div></div>"""
        message.attach(MIMEText(html, "html"))
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls() 
        server.login(SENDER_EMAIL, SENDER_APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        server.quit()
    except Exception as e: pass

@app.post("/api/v1/auth/register-initiate")
def register_initiate(user_in: UserRegisterInitiate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db.query(models.PendingUser).filter(models.PendingUser.email == user_in.email).delete()
    db.commit()

    code = generate_verification_code()
    pending = models.PendingUser(
        name=user_in.name, email=user_in.email, role=user_in.role, address=user_in.address,
        pincode=user_in.pincode, hashed_password=hash_password(user_in.password),
        verification_code=code, expires_at=datetime.now(timezone.utc) + timedelta(minutes=15)
    )
    db.add(pending)
    db.commit()
    send_verification_email(user_in.email, code)
    return {"message": "Verification code sent"}

@app.post("/api/v1/auth/verify")
def verify_account(verify_in: UserVerify, db: Session = Depends(get_db)):
    pending = db.query(models.PendingUser).filter(models.PendingUser.email == verify_in.email).first()
    if not pending or pending.verification_code != verify_in.code:
        raise HTTPException(status_code=400, detail="Invalid code")
    
    new_user = models.User(
        name=pending.name, email=pending.email, role=pending.role, 
        address=pending.address, pincode=pending.pincode, hashed_password=pending.hashed_password
    )
    db.add(new_user)
    db.delete(pending)
    db.commit()
    return {"access_token": f"mock_token_{new_user.id}", "token_type": "bearer", "role": new_user.role}

@app.post("/api/v1/auth/login")
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": f"mock_token_{user.id}", "token_type": "bearer", "role": user.role}

# ==========================================
# CORE ENGINE (SWEEPER, DROPS, CHECKOUT)
# ==========================================
async def sweep_expired_carts():
    while True:
        await asyncio.sleep(10)
        db = SessionLocal()
        try:
            now = datetime.now(timezone.utc)
            expired_res = db.query(models.Reservation).filter(models.Reservation.status == models.ReservationState.RESERVED).all()
            for res in expired_res:
                expire_time = res.expires_at.replace(tzinfo=timezone.utc) if res.expires_at.tzinfo is None else res.expires_at
                if expire_time <= now:
                    res.status = models.ReservationState.EXPIRED
                    shoe = db.query(models.Product).filter(models.Product.id == res.shoe_id).first()
                    if shoe:
                        shoe.available_stock += 1
                        if shoe.status == models.ProductState.SOLD_OUT and (not shoe.drop_end or shoe.drop_end.replace(tzinfo=timezone.utc) > now):
                            shoe.status = models.ProductState.LIVE
            
            upcoming_shoes = db.query(models.Product).filter(models.Product.status == models.ProductState.UPCOMING).all()
            for shoe in upcoming_shoes:
                if shoe.drop_start and shoe.drop_start.replace(tzinfo=timezone.utc) <= now:
                    shoe.status = models.ProductState.LIVE

            live_shoes = db.query(models.Product).filter(models.Product.status == models.ProductState.LIVE).all()
            for shoe in live_shoes:
                if shoe.drop_end and shoe.drop_end.replace(tzinfo=timezone.utc) <= now:
                    shoe.status = models.ProductState.SOLD_OUT
            db.commit()
        except: db.rollback()
        finally: db.close()

@app.on_event("startup")
async def startup_event(): asyncio.create_task(sweep_expired_carts())

@app.post("/api/v1/seed")
def seed_database(db: Session = Depends(get_db)):
    # Same as before
    return {"message": "Database seeded!"}

@app.get("/api/v1/drops")
def get_live_drops(db: Session = Depends(get_db)):
    return {"live_drops": db.query(models.Product).filter(models.Product.status == models.ProductState.LIVE).all()}

@app.get("/api/v1/upcoming")
def get_upcoming_drops(db: Session = Depends(get_db)):
    return {"upcoming_drops": db.query(models.Product).filter(models.Product.status == models.ProductState.UPCOMING, models.Product.drop_start.isnot(None)).order_by(models.Product.drop_start.asc()).all()}

@app.post("/api/v1/reserve")
def reserve_shoe(user_id: int, shoe_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        shoe = db.query(models.Product).filter(models.Product.id == shoe_id).with_for_update().first()
        if not shoe or shoe.status != models.ProductState.LIVE: raise HTTPException(status_code=400, detail="Not available")
        if shoe.available_stock <= 0: raise HTTPException(status_code=409, detail="Out of Stock")

        if shoe.is_hyped_drop:
            if db.query(models.Reservation).filter(models.Reservation.user_id == user_id, models.Reservation.shoe_id == shoe_id, models.Reservation.status == models.ReservationState.RESERVED).first() or \
               db.query(models.Order).filter(models.Order.user_id == user_id, models.Order.shoe_id == shoe_id).first():
                raise HTTPException(status_code=403, detail="1 pair per customer.")

        shoe.available_stock -= 1
        if shoe.available_stock == 0: shoe.status = models.ProductState.SOLD_OUT
            
        new_res = models.Reservation(user_id=user_id, shoe_id=shoe_id, expires_at=datetime.now(timezone.utc) + timedelta(minutes=0.5 if shoe.is_hyped_drop else 15))
        db.add(new_res)
        db.commit()
        db.refresh(new_res)
        
        # Broadcast the WebSocket live update
        background_tasks.add_task(manager.broadcast, {"type": "STOCK_UPDATE", "shoe_id": shoe.id, "available_stock": shoe.available_stock, "status": shoe.status.value})
        return {"message": "Secured!", "reservation_id": new_res.id}
    except HTTPException as he: raise he
    except: raise HTTPException(status_code=500, detail="Engine Error")

class CheckoutRequest(BaseModel): size: str
@app.post("/api/v1/checkout/{res_id}")
def complete_checkout(res_id: int, req: CheckoutRequest, db: Session = Depends(get_db)):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).with_for_update().first()
    if not res or res.status != models.ReservationState.RESERVED: raise HTTPException(status_code=400, detail="Cart expired.")
    res.status = models.ReservationState.PURCHASED
    new_order = models.Order(user_id=res.user_id, shoe_id=res.shoe_id, reservation_id=res.id, size=req.size)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {"message": "Complete!", "order_id": new_order.id}

@app.get("/api/v1/reservations/{res_id}")
def get_reservation_details(res_id: int, db: Session = Depends(get_db)):
    """Fetches the locked shoe details AND user shipping info for the checkout page."""
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res: 
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    shoe = db.query(models.Product).filter(models.Product.id == res.shoe_id).first()
    user = db.query(models.User).filter(models.User.id == res.user_id).first()
    
    return {
        "reservation": res, 
        "shoe": shoe,
        "user": {
            "address": user.address if user else "Address not found",
            "pincode": user.pincode if user else "---"
        }
    }

@app.get("/api/v1/users/{user_id}/orders")
def get_user_vault(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    return {"order_history": [{"order_id": o.id, "status": o.status, "size": o.size, "shoe": {"brand": o.shoe.brand, "model_name": o.shoe.model_name, "image_url": o.shoe.image_url, "price_inr": o.shoe.price_inr}} for o in orders]}

# ==========================================
# ADMIN ROUTES & STRICT PIPELINE
# ==========================================
VALID_TRANSITIONS = {
    models.OrderState.PENDING_VERIFICATION: [models.OrderState.AUTHENTICATED, models.OrderState.CANCELLED],
    models.OrderState.AUTHENTICATED: [models.OrderState.SHIPPED],
    models.OrderState.SHIPPED: [models.OrderState.DELIVERED],
    models.OrderState.DELIVERED: [],
    models.OrderState.CANCELLED: []
}

class ProductCreate(BaseModel):
    brand: str
    model_name: str
    colorway: str
    price_inr: int
    image_url: str
    total_stock: int
    delay_minutes: int = 0      
    duration_hours: int = 24

class StateTransitionRequest(BaseModel):
    new_state: models.OrderState

# ==========================================
# VENDOR & ESCROW PIPELINE
# ==========================================
class VendorProductCreate(BaseModel):
    supplier_id: int
    brand: str
    model_name: str
    colorway: str
    price_inr: int
    image_url: str
    total_stock: int

# 1. THE VENDOR UPLOAD ENDPOINT
@app.post("/api/v1/vendor/products")
def vendor_upload_product(payload: dict, db: Session = Depends(get_db)):
    """Receives vendor asset and forces it into the Escrow Queue"""
    try:
        new_shoe = models.Product(
            brand=payload.get("brand", "Unknown"),
            model_name=payload.get("model_name", "Unknown"),
            colorway=payload.get("colorway", "Standard"),
            price_inr=payload.get("price_inr", 0),
            image_url=payload.get("image_url", ""),
            available_stock=payload.get("total_stock", 0), 
            
            # This is the magic lock! It ensures the Admin page sees it.
            status="PENDING_APPROVAL" 
        )
        db.add(new_shoe)
        db.commit()
        db.refresh(new_shoe)
        
        return {"message": "Asset secured in Escrow", "product_id": new_shoe.id}
    except Exception as e:
        db.rollback()
        print(f"Vendor Upload Error: {e}") # This will print exact errors to your terminal now
        raise HTTPException(status_code=500, detail=str(e))

# 2. THE ADMIN ESCROW QUEUE ENDPOINT
@app.get("/api/v1/admin/pending-products")
def get_pending_escrow_products(db: Session = Depends(get_db)):
    """Fetches ONLY assets that have the PENDING_APPROVAL status"""
    try:
        # Strictly look for the exact status we just set above
        pending_items = db.query(models.Product).filter(models.Product.status == "PENDING_APPROVAL").all()
        
        formatted_items = []
        for item in pending_items:
            formatted_items.append({
                "id": item.id,
                "supplier_id": getattr(item, 'supplier_id', 1), # Failsafe in case supplier_id column is missing
                "brand": item.brand,
                "model_name": item.model_name,
                "colorway": item.colorway,
                "price_inr": item.price_inr,
                "image_url": item.image_url,
                "total_stock": item.available_stock
            })
            
        return {"pending_products": formatted_items}
    except Exception as e:
        print(f"Admin Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ApproveProductRequest(BaseModel):
    delay_minutes: int = 0
    duration_hours: int = 24

@app.post("/api/v1/admin/products/{product_id}/approve")
def approve_product(product_id: int, req: ApproveProductRequest, db: Session = Depends(get_db)):
    """Admin approves the asset and sets the Temporal Drop Window."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product or product.status != models.ProductState.PENDING_APPROVAL:
        raise HTTPException(status_code=404, detail="Asset not found or already approved.")
    
    now = datetime.now(timezone.utc)
    start_time = now + timedelta(minutes=req.delay_minutes)
    end_time = start_time + timedelta(hours=req.duration_hours) if req.duration_hours > 0 else None
    
    product.status = models.ProductState.UPCOMING if req.delay_minutes > 0 else models.ProductState.LIVE
    product.drop_start = start_time
    product.drop_end = end_time
    
    db.commit()
    return {"message": "Asset Approved & Scheduled!"}


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
        # End time logic updated for "Always-On" shoes if duration is 0
        end_time = start_time + timedelta(hours=product.duration_hours) if product.duration_hours > 0 else None
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

@app.get("/api/v1/catalog")
def get_static_catalog(db: Session = Depends(get_db)):
    """Fetches the full static shoe registry from the 'shoes' table"""
    try:
        catalog = db.query(models.StaticShoe).all()
        return {"catalog": catalog}
    except Exception as e:
        print(f"Catalog Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch catalog")

from datetime import datetime, timezone

@app.get("/api/v1/catalog/{shoe_id}")
def get_static_shoe_details(shoe_id: str, user_id: int = 1, db: Session = Depends(get_db)):
    """Fetches static shoe details and formats them exactly like a live reservation for the checkout UI"""
    shoe = db.query(models.StaticShoe).filter(models.StaticShoe.id == shoe_id).first()
    if not shoe:
        raise HTTPException(status_code=404, detail="Shoe not found")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # Map static schema to match the dynamic frontend expectations
    formatted_shoe = {
        "id": shoe.id,
        "brand": shoe.manufacturer,
        "model_name": shoe.name,
        "colorway": shoe.color,
        "price_inr": shoe.price,
        "image_url": "/" + shoe.front_img.replace("\\", "/") if shoe.front_img else ""
    }
    
    return {
        "shoe": formatted_shoe,
        "user": {
            "address": user.address if user else "Address not found",
            "pincode": user.pincode if user else "---"
        }
    }

@app.post("/api/v1/checkout/static/{shoe_id}")
def checkout_static_shoe(shoe_id: str, payload: dict, db: Session = Depends(get_db)):
    """Processes checkout for a static shoe without needing a 30-second reservation"""
    static_shoe = db.query(models.StaticShoe).filter(models.StaticShoe.id == shoe_id).first()
    if not static_shoe: 
        raise HTTPException(status_code=404, detail="Shoe not found")

    user_id = payload.get("user_id", 1)

    # 1. JIT Transfer: Ensure the static shoe exists in the dynamic `products` table
    # so we can link it to the `orders` table for the Admin Dashboard
    product = db.query(models.Product).filter(models.Product.model_name == static_shoe.name).first()
    if not product:
        product = models.Product(
            brand=static_shoe.manufacturer,
            model_name=static_shoe.name,
            colorway=static_shoe.color,
            price_inr=static_shoe.price,
            image_url="/" + static_shoe.front_img.replace("\\", "/") if static_shoe.front_img else "",
            total_stock=999,
            available_stock=999,
            status="STATIC"
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # 2. Create the Final Order
    new_order = models.Order(
        user_id=user_id,
        shoe_id=product.id,
        reservation_id=None, # No reservation needed for static!
        size=payload.get("size"),
        status="PENDING_VERIFICATION" if payload.get("payment_method") != "cod" else "CONFIRMED",
        created_at=datetime.now(timezone.utc)
    )
    
    # Save UTR if the model supports it
    if hasattr(new_order, 'utr') and payload.get("utr_number"):
        new_order.utr = payload.get("utr_number")
        
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return {"message": "Success", "order_id": new_order.id}