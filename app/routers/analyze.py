from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, JobDescription, Analysis
from app.schemas import MatchRequest, AnalysisResult, HistoryItem
from app.services.matcher import compute_match
from app.services.ats import analyze_ats
from app.services.skill_gap import build_skill_gap, build_roadmap
from app.services.recommendations import build_recommendations
from app.services.parser import parse_resume, extract_text
from app.services.job_analyzer import parse_job_description
from app.services.demo_data import DEMO_RESUME_TEXT, DEMO_JOB_TITLE, DEMO_JOB_COMPANY, DEMO_JOB_TEXT

router = APIRouter(prefix="/api", tags=["analyze"])


def _run_pipeline(resume: Resume, job: JobDescription, db: Session) -> Analysis:
    match_result = compute_match(resume.parsed_data, job.parsed_data, resume.raw_text, job.raw_text)
    ats_result = analyze_ats(resume.raw_text, resume.parsed_data, job.parsed_data.get("keywords", []))
    skill_gap = build_skill_gap(
        match_result["missing_required_skills"], match_result["missing_preferred_skills"]
    )
    roadmap = build_roadmap(skill_gap)
    rec_result = build_recommendations(match_result, ats_result, resume.parsed_data)

    result_json = {
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_required_skills"] + match_result["missing_preferred_skills"],
        "missing_required_skills": match_result["missing_required_skills"],
        "missing_preferred_skills": match_result["missing_preferred_skills"],
        "strengths": rec_result["strengths"],
        "weaknesses": rec_result["weaknesses"],
        "recommendations": rec_result["recommendations"],
        "before_after_examples": rec_result["before_after_examples"],
        "skill_gap": skill_gap,
        "roadmap": roadmap,
        "roadmap_progress": {},  # {week_number: true/false}, updated via PATCH
        "ats_detail": {
            "keyword_analysis": ats_result["keyword_analysis"],
            "formatting_issues": ats_result["formatting_issues"],
            "content_quality": ats_result["content_quality"],
            "ats_recommendations": ats_result["recommendations"],
        },
    }

    analysis = Analysis(
        resume_id=resume.id,
        job_id=job.id,
        overall_score=match_result["overall_score"],
        skills_match=match_result["skills_match"],
        experience_match=match_result["experience_match"],
        education_match=match_result["education_match"],
        project_match=match_result["project_match"],
        keyword_match=match_result["keyword_match"],
        ats_score=ats_result["ats_score"],
        result_json=result_json,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def _to_result_schema(analysis: Analysis) -> AnalysisResult:
    r = analysis.result_json
    return AnalysisResult(
        id=analysis.id,
        overall_score=round(analysis.overall_score),
        skills_match=round(analysis.skills_match),
        experience_match=round(analysis.experience_match),
        education_match=round(analysis.education_match),
        project_match=round(analysis.project_match),
        keyword_match=round(analysis.keyword_match),
        ats_score=round(analysis.ats_score),
        matched_skills=r["matched_skills"],
        missing_skills=r["missing_skills"],
        strengths=r["strengths"],
        weaknesses=r["weaknesses"],
        recommendations=r["recommendations"],
        skill_gap=r["skill_gap"],
        roadmap=r["roadmap"],
        ats_detail=r["ats_detail"],
    )


@router.post("/analyze/match", response_model=AnalysisResult)
def analyze_match(payload: MatchRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found.")
    job = db.query(JobDescription).filter(JobDescription.id == payload.job_id).first()
    if not job:
        raise HTTPException(404, "Job description not found.")

    analysis = _run_pipeline(resume, job, db)
    return _to_result_schema(analysis)


@router.get("/analysis/{analysis_id}", response_model=AnalysisResult)
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(404, "Analysis not found.")
    return _to_result_schema(analysis)


@router.get("/analysis/history/all", response_model=list[HistoryItem])
def get_history(db: Session = Depends(get_db)):
    analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    items = []
    for a in analyses:
        items.append(HistoryItem(
            id=a.id,
            resume_label=a.resume.label if a.resume else "Deleted resume",
            job_title=a.job.title if a.job else "Deleted job",
            company=a.job.company if a.job else None,
            overall_score=round(a.overall_score),
            created_at=a.created_at.isoformat(),
        ))
    return items


@router.patch("/analysis/{analysis_id}/roadmap-progress")
def update_roadmap_progress(analysis_id: str, week: int, completed: bool, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(404, "Analysis not found.")
    result = dict(analysis.result_json)
    progress = dict(result.get("roadmap_progress", {}))
    progress[str(week)] = completed
    result["roadmap_progress"] = progress
    analysis.result_json = result
    db.commit()
    return {"status": "updated", "roadmap_progress": progress}


@router.post("/demo/run", response_model=AnalysisResult)
def run_demo(db: Session = Depends(get_db)):
    """Creates (or reuses) demo resume + job records and returns a full analysis,
    so the app can be explored without uploading anything."""
    demo_resume = db.query(Resume).filter(Resume.label == "Demo Resume").first()
    if not demo_resume:
        parsed = parse_resume(DEMO_RESUME_TEXT)
        demo_resume = Resume(
            label="Demo Resume", original_filename="demo_resume.txt",
            file_path="", raw_text=DEMO_RESUME_TEXT, parsed_data=parsed,
        )
        db.add(demo_resume)
        db.commit()
        db.refresh(demo_resume)

    demo_job = db.query(JobDescription).filter(JobDescription.title == DEMO_JOB_TITLE).first()
    if not demo_job:
        parsed_job = parse_job_description(DEMO_JOB_TEXT)
        demo_job = JobDescription(
            title=DEMO_JOB_TITLE, company=DEMO_JOB_COMPANY,
            raw_text=DEMO_JOB_TEXT, parsed_data=parsed_job,
        )
        db.add(demo_job)
        db.commit()
        db.refresh(demo_job)

    analysis = _run_pipeline(demo_resume, demo_job, db)
    return _to_result_schema(analysis)
