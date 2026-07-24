from fastapi import FastAPI

from app.core.config import settings
from app.db.database import engine
from app.db.base import Base

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="From Code to Career",
)

# Create all database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }