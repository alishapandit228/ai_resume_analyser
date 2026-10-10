from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, JobDescription
from app.schemas import ChatMessageIn, ChatMessageOut
from app.services.llm_client import get_llm_client

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are a career assistant embedded in a resume analysis app. "
    "Only use the resume text and job description text given to you as context. "
    "Never invent experience, skills, or achievements the user did not write. "
    "Be concise, specific, and practical. If asked to rewrite a bullet point, "
    "keep it truthful to the original content and do not add unverifiable metrics."
)


@router.post("/", response_model=ChatMessageOut)
def chat(payload: ChatMessageIn, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")

    job_text = ""
    if payload.job_id:
        job = db.query(JobDescription).filter(JobDescription.id == payload.job_id).first()
        if job:
            job_text = f"\n\nJOB DESCRIPTION:\n{job.raw_text}"

    user_prompt = (
        f"RESUME:\n{resume.raw_text}{job_text}\n\n"
        f"USER QUESTION:\n{payload.message}"
    )

    client = get_llm_client()
    reply = client.generate(SYSTEM_PROMPT, user_prompt)
    return ChatMessageOut(reply=reply)
