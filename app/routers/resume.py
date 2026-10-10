import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Resume
from app.schemas import ResumeUploadResponse, ResumeOut
from app.services.parser import extract_text, parse_resume, ParsingError

router = APIRouter(prefix="/api/resume", tags=["resume"])
settings = get_settings()
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    label: str = Form("My Resume"),
    db: Session = Depends(get_db),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file.")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_MB:
        raise HTTPException(400, f"File too large ({size_mb:.1f}MB). Max size is {settings.MAX_UPLOAD_MB}MB.")
    if size_mb == 0:
        raise HTTPException(400, "The uploaded file is empty.")

    saved_name = f"{uuid.uuid4()}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(contents)

    try:
        text = extract_text(saved_path, file.filename)
        parsed = parse_resume(text)
    except ParsingError as e:
        os.remove(saved_path)
        raise HTTPException(422, str(e))

    resume = Resume(
        label=label,
        original_filename=file.filename,
        file_path=saved_path,
        raw_text=text,
        parsed_data=parsed,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeUploadResponse(
        id=resume.id,
        original_filename=resume.original_filename,
        label=resume.label,
        text_preview=text[:600],
        parsed_data=parsed,
    )


@router.get("/list", response_model=list[ResumeOut])
def list_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).order_by(Resume.created_at.desc()).all()
    return [
        ResumeOut(
            id=r.id, label=r.label, original_filename=r.original_filename,
            created_at=r.created_at.isoformat(), parsed_data=r.parsed_data,
        )
        for r in resumes
    ]


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: str, db: Session = Depends(get_db)):
    r = db.query(Resume).filter(Resume.id == resume_id).first()
    if not r:
        raise HTTPException(404, "Resume not found.")
    return ResumeOut(
        id=r.id, label=r.label, original_filename=r.original_filename,
        created_at=r.created_at.isoformat(), parsed_data=r.parsed_data,
    )


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    r = db.query(Resume).filter(Resume.id == resume_id).first()
    if not r:
        raise HTTPException(404, "Resume not found.")
    if r.file_path and os.path.exists(r.file_path):
        os.remove(r.file_path)
    db.delete(r)
    db.commit()
    return {"status": "deleted", "id": resume_id}
