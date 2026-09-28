from pydantic import BaseModel, Field


class InterviewQuestionsRequest(BaseModel):
    career_goal: str = Field(min_length=2, max_length=100)
    experience_level: str = Field(min_length=2, max_length=50)
    focus_area: str | None = Field(default=None, max_length=100)
    count: int = Field(default=5, ge=3, le=8)


class InterviewQuestion(BaseModel):
    question: str
    category: str
    evaluation_focus: str


class InterviewQuestionsResponse(BaseModel):
    questions: list[InterviewQuestion]


class InterviewFeedbackRequest(BaseModel):
    career_goal: str = Field(min_length=2, max_length=100)
    experience_level: str = Field(min_length=2, max_length=50)
    question: str = Field(min_length=5, max_length=1200)
    answer: str = Field(min_length=5, max_length=6000)


class InterviewFeedbackResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    summary: str
    strengths: list[str]
    improvements: list[str]
    sample_answer: str
