import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user
from app.db.database import get_db

from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.resume import Resume
from app.models.career_analysis import CareerAnalysis

from app.ai.career_analyzer import analyze_career
from app.ai.resume_analyzer import analyze_resume

from app.schemas.ai import AIAnalyzeResponse


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post(
    "/analyze",
    response_model=AIAnalyzeResponse
)
def analyze_user_career(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):

    # =====================================================
    # 1. Get user profile
    # =====================================================

    profile = (
        db.query(UserProfile)
        .filter(
            UserProfile.user_id
            == current_user.id
        )
        .first()
    )

    if not profile:

        raise HTTPException(
            status_code=404,
            detail=(
                "Profile not found. "
                "Please create your profile first."
            )
        )

    # =====================================================
    # 2. Validate skills
    # =====================================================

    if not profile.skills:

        raise HTTPException(
            status_code=400,
            detail=(
                "Skills are required "
                "for AI analysis."
            )
        )

    # =====================================================
    # 3. Get latest resume
    # =====================================================

    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id
            == current_user.id
        )
        .order_by(
            Resume.created_at.desc()
        )
        .first()
    )

    if not resume:

        raise HTTPException(
            status_code=404,
            detail=(
                "Resume not found. "
                "Please upload your resume first."
            )
        )

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail=(
                "Resume text is not available "
                "for analysis."
            )
        )

    # =====================================================
    # 4. Convert skills into list
    # =====================================================

    skills = [
        skill.strip()
        for skill in profile.skills.split(",")
        if skill.strip()
    ]

    # =====================================================
    # 5. Run Career AI Analysis
    # =====================================================

    career_result = analyze_career(
        career_goal=profile.target_role,
        skills=skills,
        experience=profile.experience_level,
        resume_text=resume.extracted_text,
    )

    # =====================================================
    # 6. Run Resume AI Analysis
    # =====================================================

    resume_result = analyze_resume(
        resume_text=resume.extracted_text
    )

    # =====================================================
    # 7. Save analysis result to database
    # =====================================================

    career_analysis = CareerAnalysis(

        user_id=current_user.id,

        career_goal=career_result[
            "career"
        ],

        suitability=career_result[
            "suitability"
        ],

        career_readiness_score=career_result[
            "career_readiness_score"
        ],

        resume_score=resume_result[
            "resume_score"
        ],

        strengths=json.dumps(
            career_result[
                "strengths"
            ]
        ),

        skill_gaps=json.dumps(
            career_result[
                "skill_gaps"
            ]
        ),

        recommended_skills=json.dumps(
            career_result[
                "recommended_skills"
            ]
        ),

        recommended_projects=json.dumps(
            career_result[
                "recommended_projects"
            ]
        ),

        roadmap=json.dumps(
            career_result[
                "roadmap"
            ]
        ),

        profile_resume_match=json.dumps(
            career_result[
                "profile_resume_match"
            ]
        ),

        resume_summary=resume_result[
            "summary"
        ],

        resume_strengths=json.dumps(
            resume_result[
                "strengths"
            ]
        ),

        resume_missing_skills=json.dumps(
            resume_result[
                "missing_skills"
            ]
        ),

        resume_improvement_suggestions=json.dumps(
            resume_result[
                "improvement_suggestions"
            ]
        ),

        resume_recommended_projects=json.dumps(
            resume_result[
                "recommended_projects"
            ]
        ),
    )

    db.add(career_analysis)

    db.commit()

    db.refresh(
        career_analysis
    )

    # =====================================================
    # 8. Return analysis response
    # =====================================================

    return {

        **career_result,

        "resume_score":
            resume_result[
                "resume_score"
            ],

        "resume_summary":
            resume_result[
                "summary"
            ],

        "resume_strengths":
            resume_result[
                "strengths"
            ],

        "resume_missing_skills":
            resume_result[
                "missing_skills"
            ],

        "resume_improvement_suggestions":
            resume_result[
                "improvement_suggestions"
            ],

        "resume_recommended_projects":
            resume_result[
                "recommended_projects"
            ],
    }

@router.get(
    "/analysis",
    response_model=AIAnalyzeResponse
)
def get_latest_analysis(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    # Get latest saved analysis
    analysis = (
        db.query(CareerAnalysis)
        .filter(
            CareerAnalysis.user_id
            == current_user.id
        )
        .order_by(
            CareerAnalysis.created_at.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No career analysis found."
        )

    # Convert stored JSON strings back to lists
    return {
        "career": analysis.career_goal,
        "suitability": analysis.suitability,

        "strengths": json.loads(
            analysis.strengths or "[]"
        ),

        "skill_gaps": json.loads(
            analysis.skill_gaps or "[]"
        ),

        "recommended_skills": json.loads(
            analysis.recommended_skills or "[]"
        ),

        "recommended_projects": json.loads(
            analysis.recommended_projects or "[]"
        ),

        "roadmap": json.loads(
            analysis.roadmap or "[]"
        ),

        "profile_resume_match": json.loads(
            analysis.profile_resume_match or "[]"
        ),

        "career_readiness_score":
            analysis.career_readiness_score,

        "resume_score":
            analysis.resume_score,

        "resume_summary":
            analysis.resume_summary or "",

        "resume_strengths": json.loads(
            analysis.resume_strengths or "[]"
        ),

        "resume_missing_skills": json.loads(
            analysis.resume_missing_skills or "[]"
        ),

        "resume_improvement_suggestions":
            json.loads(
                analysis.resume_improvement_suggestions
                or "[]"
            ),

        "resume_recommended_projects":
            json.loads(
                analysis.resume_recommended_projects
                or "[]"
            ),
    }

@router.get("/roadmap")
def get_latest_roadmap(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    # Get latest saved career analysis
    analysis = (
        db.query(CareerAnalysis)
        .filter(
            CareerAnalysis.user_id
            == current_user.id
        )
        .order_by(
            CareerAnalysis.created_at.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No career analysis found."
        )

    roadmap = json.loads(
        analysis.roadmap or "[]"
    )

    return {
        "career": analysis.career_goal,
        "roadmap": roadmap
    }