from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime, timezone

class ProductState(str, enum.Enum):
    UPCOMING = "UPCOMING"
    LIVE = "LIVE"
    SOLD_OUT = "SOLD_OUT"

class ReservationState(str, enum.Enum):
    RESERVED = "RESERVED"
    PURCHASED = "PURCHASED"
    EXPIRED = "EXPIRED"

class OrderState(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    AUTHENTICATED = "AUTHENTICATED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    model_name = Column(String)
    colorway = Column(String)
    price_inr = Column(Integer)
    image_url = Column(String)
    total_stock = Column(Integer, default=0)
    available_stock = Column(Integer, default=0)
    status = Column(SQLEnum(ProductState), default=ProductState.UPCOMING)
    is_hyped_drop = Column(Boolean, default=True)
    drop_start = Column(DateTime, nullable=True)
    drop_end = Column(DateTime, nullable=True)

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) 
    shoe_id = Column(Integer, ForeignKey("products.id"))
    status = Column(SQLEnum(ReservationState), default=ReservationState.RESERVED)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    shoe_id = Column(Integer, ForeignKey("products.id"))
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    size = Column(String)
    
    # NEW: State-Aware Status Column
    status = Column(SQLEnum(OrderState), default=OrderState.PENDING_VERIFICATION)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    shoe = relationship("Product")