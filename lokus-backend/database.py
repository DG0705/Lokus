from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Using SQLite for instant local testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./lokus_state_engine.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# THIS is the function your main.py is looking for!
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()