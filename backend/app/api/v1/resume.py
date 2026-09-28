from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user
from app.db.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_parser import extract_text_from_pdf


router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/latest")
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet.")

    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "status": resume.status,
        "created_at": resume.created_at,
    }


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    file_extension = Path(file.filename).suffix.lower()

    if file_extension != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed",
        )

    unique_filename = f"{uuid4()}.pdf"
    file_path = UPLOAD_DIR / unique_filename

    file_content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    try:
        extracted_text = extract_text_from_pdf(str(file_path))
    except Exception:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from resume",
        )

    if not extracted_text:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="No readable text found in resume",
        )

    resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=str(file_path),
        extracted_text=extracted_text,
        status="extracted",
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "status": resume.status,
        "message": "Resume uploaded and text extracted successfully",
    }
