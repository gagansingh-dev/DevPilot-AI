from pydantic import BaseModel
from typing import List


class AIAnalyzeRequest(BaseModel):
    career_goal: str
    skills: List[str]
    experience: str


class SkillMatch(BaseModel):
    skill: str
    profile_claim: bool
    resume_evidence: bool
    status: str


class RoadmapPhase(BaseModel):
    phase: int
    title: str
    skills: List[str]
    tasks: List[str]


class AIAnalyzeResponse(BaseModel):
    career: str
    suitability: str

    strengths: List[str]
    skill_gaps: List[str]

    recommended_skills: List[str]
    recommended_projects: List[str]

    roadmap: List[RoadmapPhase]

    profile_resume_match: List[SkillMatch]

    career_readiness_score: int

    resume_score: int
    resume_summary: str

    resume_strengths: List[str]
    resume_missing_skills: List[str]

    resume_improvement_suggestions: List[str]
    resume_recommended_projects: List[str]