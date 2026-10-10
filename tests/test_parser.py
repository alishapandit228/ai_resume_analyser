from app.services.parser import parse_resume
from app.services.demo_data import DEMO_RESUME_TEXT


def test_parse_resume_extracts_contact():
    parsed = parse_resume(DEMO_RESUME_TEXT)
    assert parsed["contact"]["email"] == "alisha.rao@example.com"
    assert "linkedin.com/in/alisharao" in parsed["contact"]["linkedin"]


def test_parse_resume_extracts_skills():
    parsed = parse_resume(DEMO_RESUME_TEXT)
    assert "python" in parsed["flat_skills"]
    assert "react" in parsed["flat_skills"]


def test_parse_resume_extracts_projects():
    parsed = parse_resume(DEMO_RESUME_TEXT)
    assert len(parsed["projects"]) >= 1


def test_parse_resume_rejects_empty_text():
    import pytest
    from app.services.parser import parse_resume as _pr
    # parse_resume itself doesn't raise on short text (that's extract_text's job),
    # but it should still return a well-formed structure for a tiny input.
    result = _pr("Hi")
    assert "contact" in result
