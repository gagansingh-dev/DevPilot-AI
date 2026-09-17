from fastapi import FastAPI

from app.core.config import settings

from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.resume import router as resume_router
from app.api.v1.ai import router as ai_router
from app.api.v1.github import router as github_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="From Code to Career",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    profile_router,
    prefix="/api/v1",
)

app.include_router(
    resume_router,
    prefix="/api/v1",
)

app.include_router(
    ai_router,
    prefix="/api/v1",
)

app.include_router(
    github_router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": f"Welcome to {settings.APP_NAME} 🚀"
    }