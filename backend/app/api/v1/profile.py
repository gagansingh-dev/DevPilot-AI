from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileResponse,
)
from app.api.v1.dependencies import get_current_user


router = APIRouter(
    prefix="/profile",
    tags=["User Profile"],
)


@router.post(
    "",
    response_model=UserProfileResponse,
)
def create_profile(
    profile: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists",
        )

    new_profile = UserProfile(
        user_id=current_user.id,
        full_name=profile.full_name,
        target_role=profile.target_role,
        experience_level=profile.experience_level,
        bio=profile.bio,
        skills=profile.skills,
        github_username=profile.github_username,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get(
    "",
    response_model=UserProfileResponse,
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


@router.put(
    "",
    response_model=UserProfileResponse,
)
def update_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    profile.full_name = profile_data.full_name
    profile.target_role = profile_data.target_role
    profile.experience_level = profile_data.experience_level
    profile.bio = profile_data.bio
    profile.skills = profile_data.skills
    profile.github_username = profile_data.github_username

    db.commit()
    db.refresh(profile)

    return profile