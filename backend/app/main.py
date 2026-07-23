from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="From Code to Career",
)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }