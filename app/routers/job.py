from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobDescription
from app.schemas import JobDescriptionIn, JobDescriptionOut
from app.services.job_analyzer import parse_job_description

router = APIRouter(prefix="/api/job", tags=["job"])


@router.post("/analyze", response_model=JobDescriptionOut)
def analyze_job(payload: JobDescriptionIn, db: Session = Depends(get_db)):
    if len(payload.text.split()) < 15:
        raise HTTPException(422, "Job description looks too short to analyze meaningfully.")

    parsed = parse_job_description(payload.text)
    job = JobDescription(
        title=payload.title,
        company=payload.company,
        raw_text=payload.text,
        parsed_data=parsed,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return JobDescriptionOut(id=job.id, title=job.title, company=job.company, parsed_data=parsed)


@router.get("/list", response_model=list[JobDescriptionOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return [JobDescriptionOut(id=j.id, title=j.title, company=j.company, parsed_data=j.parsed_data) for j in jobs]


@router.get("/{job_id}", response_model=JobDescriptionOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    j = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not j:
        raise HTTPException(404, "Job description not found.")
    return JobDescriptionOut(id=j.id, title=j.title, company=j.company, parsed_data=j.parsed_data)
