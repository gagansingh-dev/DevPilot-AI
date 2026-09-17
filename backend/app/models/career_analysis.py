from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CareerAnalysis(Base):
    __tablename__ = "career_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    career_goal: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    suitability: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    career_readiness_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    resume_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    strengths: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    skill_gaps: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    recommended_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    recommended_projects: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    roadmap: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    profile_resume_match: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resume_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resume_strengths: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resume_missing_skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resume_improvement_suggestions: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    resume_recommended_projects: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )