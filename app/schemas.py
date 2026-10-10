from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ---------- Resume ----------

class ResumeUploadResponse(BaseModel):
    id: str
    original_filename: str
    label: str
    text_preview: str
    parsed_data: Dict[str, Any]


class ResumeOut(BaseModel):
    id: str
    label: str
    original_filename: str
    created_at: str
    parsed_data: Dict[str, Any]


# ---------- Job Description ----------

class JobDescriptionIn(BaseModel):
    title: str = Field(..., min_length=1)
    company: Optional[str] = None
    text: str = Field(..., min_length=20, description="Full job description text")


class JobDescriptionOut(BaseModel):
    id: str
    title: str
    company: Optional[str]
    parsed_data: Dict[str, Any]


# ---------- Matching / Analysis ----------

class MatchRequest(BaseModel):
    resume_id: str
    job_id: str


class SkillGapItem(BaseModel):
    skill: str
    importance: str
    why_it_matters: str
    recommended_topics: List[str]
    difficulty: str
    suggested_project: str


class RoadmapWeek(BaseModel):
    week: int
    title: str
    topics: List[str]


class AnalysisResult(BaseModel):
    id: str
    overall_score: int
    skills_match: int
    experience_match: int
    education_match: int
    project_match: int
    keyword_match: int
    ats_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[Dict[str, str]]
    skill_gap: List[SkillGapItem]
    roadmap: List[RoadmapWeek]
    ats_detail: Dict[str, Any]
    disclaimer: str = (
        "This is an AI-generated compatibility estimate, not a hiring "
        "probability. Please review all suggestions yourself before using them."
    )


# ---------- Chat ----------

class ChatMessageIn(BaseModel):
    resume_id: str
    job_id: Optional[str] = None
    message: str


class ChatMessageOut(BaseModel):
    reply: str


# ---------- History ----------

class HistoryItem(BaseModel):
    id: str
    resume_label: str
    job_title: str
    company: Optional[str]
    overall_score: int
    created_at: str
