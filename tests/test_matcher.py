from app.services.parser import parse_resume
from app.services.job_analyzer import parse_job_description
from app.services.matcher import compute_match
from app.services.demo_data import DEMO_RESUME_TEXT, DEMO_JOB_TEXT


def test_compute_match_returns_scores_in_range():
    resume_parsed = parse_resume(DEMO_RESUME_TEXT)
    job_parsed = parse_job_description(DEMO_JOB_TEXT)
    result = compute_match(resume_parsed, job_parsed, DEMO_RESUME_TEXT, DEMO_JOB_TEXT)

    for key in ["overall_score", "skills_match", "experience_match", "education_match", "project_match", "keyword_match"]:
        assert 0 <= result[key] <= 100, f"{key} out of range: {result[key]}"


def test_compute_match_finds_matched_skills():
    resume_parsed = parse_resume(DEMO_RESUME_TEXT)
    job_parsed = parse_job_description(DEMO_JOB_TEXT)
    result = compute_match(resume_parsed, job_parsed, DEMO_RESUME_TEXT, DEMO_JOB_TEXT)
    assert "react" in result["matched_skills"]


def test_compute_match_identifies_missing_skills():
    resume_parsed = parse_resume(DEMO_RESUME_TEXT)
    job_parsed = parse_job_description(DEMO_JOB_TEXT)
    result = compute_match(resume_parsed, job_parsed, DEMO_RESUME_TEXT, DEMO_JOB_TEXT)
    # Demo JD mentions Docker/AWS as preferred, which the demo resume lacks.
    all_missing = result["missing_required_skills"] + result["missing_preferred_skills"]
    assert any(s in all_missing for s in ["docker", "aws"])
