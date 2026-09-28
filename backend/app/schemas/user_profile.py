from pydantic import BaseModel, Field


class UserProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    target_role: str = Field(..., min_length=2, max_length=100)
    experience_level: str = Field(..., min_length=2, max_length=50)
    bio: str | None = None
    skills: str | None = None
    github_username: str | None = Field(
        default=None,
        max_length=100
    )


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    target_role: str
    experience_level: str
    bio: str | None
    skills: str | None
    github_username: str | None

    class Config:
        from_attributes = True