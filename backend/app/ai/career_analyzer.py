import json

from app.ai.gemini import generate_response


def analyze_career(
    career_goal: str,
    skills: list[str],
    experience: str,
    resume_text: str,
) -> dict:

    skills_text = ", ".join(skills)

    prompt = f"""
You are the main AI Career Engine of DevPilot AI.

Analyze the student's complete career profile using BOTH
the profile information and the resume.

=== PROFILE ===
Career Goal: {career_goal}
Experience Level: {experience}
Self-Declared Skills: {skills_text}

=== RESUME ===
{resume_text}

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside JSON.

Use exactly this structure:

{{
    "career": "string",

    "suitability": "High/Medium/Low",

    "strengths": [
        "string"
    ],

    "skill_gaps": [
        "string"
    ],

    "recommended_skills": [
        "string"
    ],

    "recommended_projects": [
        "string"
    ],

    "roadmap": [
        {{
            "phase": 1,
            "title": "string",
            "skills": [
                "string"
            ],
            "tasks": [
                "string"
            ]
        }}
    ],

    "profile_resume_match": [
        {{
            "skill": "string",
            "profile_claim": true,
            "resume_evidence": true,
            "status": "Verified/Claimed Only/Not Found"
        }}
    ],

    "career_readiness_score": 0
}}

Rules:

1. Compare self-declared skills against actual resume evidence.

2. Do not treat a skill as verified only because the student
   entered it in their profile.

3. If a skill appears in the profile but there is no evidence
   in the resume, mark it as "Claimed Only".

4. If a skill appears in both profile and resume, mark it
   as "Verified".

5. If an important career skill appears in neither, identify
   it as a skill gap.

6. Do not invent projects, experience, education, or skills.

7. career_readiness_score must be an integer from 0 to 100.

8. Base the score on the student's current evidence,
   target career, skills, and experience level.

9. Keep recommendations practical for a student.

10. Return valid JSON only.

11. Generate the roadmap in exactly 5 phases.

12. Each phase must contain:
    - phase: integer from 1 to 5
    - title: short and meaningful phase name
    - skills: list of skills to learn
    - tasks: list of practical tasks to complete

13. Personalize the roadmap according to:
    - career goal
    - experience level
    - current skills
    - identified skill gaps
    - resume evidence

14. Order the roadmap from fundamentals
    to job readiness.

15. The five phases should progressively move the student
    from learning fundamentals to building projects,
    deployment, and career preparation.

16. Do not add technologies that are unrelated
    to the target career.

17. Keep each phase practical and suitable for a student.

18. Do not repeat the same tasks unnecessarily
    across multiple phases.

19. Return roadmap phases as JSON objects,
    not plain strings.

20. Make sure the roadmap always contains exactly
    5 phase objects.
"""

    response = generate_response(prompt)

    return json.loads(response)