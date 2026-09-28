from fastapi import APIRouter, Depends, HTTPException

from app.ai.interview_coach import evaluate_answer, generate_questions
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.schemas.interview import (
    InterviewFeedbackRequest,
    InterviewFeedbackResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
)


router = APIRouter(prefix="/interview", tags=["Interview Practice"])


@router.post("/questions", response_model=InterviewQuestionsResponse)
def get_interview_questions(
    payload: InterviewQuestionsRequest,
    _current_user: User = Depends(get_current_user),
):
    try:
        return {
            "questions": generate_questions(
                career_goal=payload.career_goal,
                experience_level=payload.experience_level,
                focus_area=payload.focus_area,
                count=payload.count,
            )
        }
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="Interview questions are temporarily unavailable. Please try again.",
        ) from error


@router.post("/feedback", response_model=InterviewFeedbackResponse)
def get_interview_feedback(
    payload: InterviewFeedbackRequest,
    _current_user: User = Depends(get_current_user),
):
    try:
        return evaluate_answer(
            career_goal=payload.career_goal,
            experience_level=payload.experience_level,
            question=payload.question,
            answer=payload.answer,
        )
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="Interview feedback is temporarily unavailable. Please try again.",
        ) from error
