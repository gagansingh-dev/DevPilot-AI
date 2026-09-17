import json

from app.ai.gemini import generate_response


def analyze_resume(resume_text: str) -> dict:

    prompt = f"""
You are the AI Resume Analyzer of DevPilot AI.

Analyze the following resume:

--- RESUME START ---
{resume_text}
--- RESUME END ---

Return ONLY valid JSON.
Do not use markdown.
Do not add any explanation outside the JSON.

Use exactly this structure:

{{
    "resume_score": 0,
    "summary": "string",
    "strengths": ["string"],
    "missing_skills": ["string"],
    "improvement_suggestions": ["string"],
    "recommended_projects": ["string"]
}}

Rules:
- resume_score must be a number from 0 to 100.
- Base the analysis only on the resume content.
- Do not invent experience, skills, education, or projects.
- Identify genuine strengths from the resume.
- Identify important missing skills based on the candidate's apparent target/technical profile.
- Suggestions should be practical and specific.
- Keep the response concise but useful.
"""

    response = generate_response(prompt)

    return json.loads(response)