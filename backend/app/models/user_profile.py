from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    target_role: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    experience_level: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    github_username: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )