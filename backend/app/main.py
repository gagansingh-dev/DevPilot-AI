from fastapi import FastAPI

from app.core.config import settings
from app.api.v1.auth import router as auth_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="From Code to Career",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }