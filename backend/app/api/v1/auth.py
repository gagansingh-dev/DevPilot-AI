from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.api.v1.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(or_(User.email == user.email, User.username == user.username))
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="That email or username is already registered.",
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
    }


@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={
            "sub": str(db_user.id),
            "email": db_user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
