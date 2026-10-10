import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    """Minimal user profile. Real auth (OAuth/JWT) is out of scope for the
    demo but the model is here so the app is ready for it."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    label = Column(String, default="My Resume")  # e.g. "Software Engineer Resume"
    original_filename = Column(String)
    file_path = Column(String)
    raw_text = Column(Text)
    parsed_data = Column(JSON)  # structured extraction: contact, education, skills, experience...
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String)
    company = Column(String, nullable=True)
    raw_text = Column(Text)
    parsed_data = Column(JSON)  # required/preferred skills, experience, education, keywords
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="job", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=gen_id)
    resume_id = Column(String, ForeignKey("resumes.id"))
    job_id = Column(String, ForeignKey("job_descriptions.id"))

    overall_score = Column(Float)
    skills_match = Column(Float)
    experience_match = Column(Float)
    education_match = Column(Float)
    project_match = Column(Float)
    keyword_match = Column(Float)
    ats_score = Column(Float)

    result_json = Column(JSON)  # full structured result: matched/missing skills, ATS detail,
                                 # strengths, weaknesses, recommendations, roadmap, skill gap
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
    job = relationship("JobDescription", back_populates="analyses")
