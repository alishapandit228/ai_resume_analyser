"""
Resume <-> Job Description matching engine.

Uses classic NLP (TF-IDF + cosine similarity) for semantic/keyword
similarity, combined with rule-based set comparison for skills, education
and experience. This keeps the app fully functional with zero external API
calls; an LLM can optionally be layered on top for the "reasoning" /
recommendations step (see services/llm_client.py).
"""
import re
from typing import Dict, Any, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.parser import YEAR_RE  # reuse year regex


def _cosine_text_similarity(text_a: str, text_b: str) -> float:
    if not text_a.strip() or not text_b.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english", max_features=2000)
    try:
        matrix = vectorizer.fit_transform([text_a, text_b])
    except ValueError:
        return 0.0
    score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return round(float(score) * 100, 1)


def _skills_match(resume_skills: List[str], required: List[str], preferred: List[str]) -> Dict[str, Any]:
    resume_set = set(s.lower() for s in resume_skills)
    required_set = set(s.lower() for s in required)
    preferred_set = set(s.lower() for s in preferred)
    all_job_skills = required_set | preferred_set

    matched = sorted(resume_set & all_job_skills)
    missing_required = sorted(required_set - resume_set)
    missing_preferred = sorted(preferred_set - resume_set)

    if not all_job_skills:
        pct = 100.0 if resume_set else 0.0
    else:
        # Required skills weigh more than preferred ones.
        req_hit = len(required_set & resume_set)
        pref_hit = len(preferred_set & resume_set)
        req_weight, pref_weight = 0.75, 0.25
        req_score = (req_hit / len(required_set)) if required_set else 1.0
        pref_score = (pref_hit / len(preferred_set)) if preferred_set else 1.0
        pct = (req_score * req_weight + pref_score * pref_weight) * 100

    return {
        "percent": round(pct, 1),
        "matched": matched,
        "missing_required": missing_required,
        "missing_preferred": missing_preferred,
    }


def _experience_match(resume_experience: List[Dict], job_experience_req: Dict) -> float:
    min_years = job_experience_req.get("min_years")
    if min_years is None:
        return 100.0  # JD didn't specify a requirement — treat as satisfied

    # Rough candidate-experience estimate: count distinct years mentioned
    # across experience entries as a proxy for tenure length.
    years_mentioned = set()
    for entry in resume_experience:
        duration = entry.get("duration") or ""
        years_mentioned.update(YEAR_RE.findall(duration))
    years_mentioned = sorted(int(y) for y in years_mentioned)
    estimated_years = (years_mentioned[-1] - years_mentioned[0]) if len(years_mentioned) >= 2 else len(resume_experience)

    if estimated_years >= min_years:
        return 100.0
    if min_years == 0:
        return 100.0
    return round(max(estimated_years / min_years, 0) * 100, 1)


def _education_match(resume_education: List[Dict], education_requirement: str | None) -> float:
    if not education_requirement:
        return 100.0
    if not resume_education:
        return 40.0  # can't verify — partial credit, flagged for user review
    req_lower = education_requirement.lower()
    for edu in resume_education:
        degree_text = (edu.get("degree") or "").lower()
        if any(tok in degree_text for tok in ["b.e", "b.tech", "bachelor", "b.sc"]) and \
           any(tok in req_lower for tok in ["b.e", "b.tech", "bachelor", "b.sc", "degree"]):
            return 100.0
        if any(tok in degree_text for tok in ["m.e", "m.tech", "master", "m.sc"]) and \
           any(tok in req_lower for tok in ["m.e", "m.tech", "master", "m.sc"]):
            return 100.0
    return 60.0  # some education present, but doesn't clearly match the requirement


def _project_match(resume_projects: List[Dict], required_skills: List[str], preferred_skills: List[str]) -> float:
    if not resume_projects:
        return 0.0
    job_skills = set(s.lower() for s in required_skills + preferred_skills)
    if not job_skills:
        return 70.0 if resume_projects else 0.0
    hits = 0
    for proj in resume_projects:
        proj_techs = set(t.lower() for t in proj.get("technologies", []))
        if proj_techs & job_skills:
            hits += 1
    ratio = hits / max(len(resume_projects), 1)
    coverage = len({t.lower() for p in resume_projects for t in p.get("technologies", [])} & job_skills) / max(len(job_skills), 1)
    return round(min((ratio * 0.5 + coverage * 0.5) * 100, 100), 1)


def compute_match(resume_parsed: Dict[str, Any], job_parsed: Dict[str, Any], resume_text: str, job_text: str) -> Dict[str, Any]:
    skills_result = _skills_match(
        resume_parsed.get("flat_skills", []),
        job_parsed.get("required_skills", []),
        job_parsed.get("preferred_skills", []),
    )
    experience_pct = _experience_match(resume_parsed.get("experience", []), job_parsed.get("experience", {}))
    education_pct = _education_match(resume_parsed.get("education", []), job_parsed.get("education_requirement"))
    project_pct = _project_match(
        resume_parsed.get("projects", []),
        job_parsed.get("required_skills", []),
        job_parsed.get("preferred_skills", []),
    )
    keyword_pct = _cosine_text_similarity(resume_text, job_text)

    weights = {
        "skills": 0.35,
        "experience": 0.20,
        "education": 0.10,
        "projects": 0.20,
        "keywords": 0.15,
    }
    overall = (
        skills_result["percent"] * weights["skills"]
        + experience_pct * weights["experience"]
        + education_pct * weights["education"]
        + project_pct * weights["projects"]
        + keyword_pct * weights["keywords"]
    )

    return {
        "overall_score": round(overall, 1),
        "skills_match": skills_result["percent"],
        "experience_match": experience_pct,
        "education_match": education_pct,
        "project_match": project_pct,
        "keyword_match": keyword_pct,
        "matched_skills": skills_result["matched"],
        "missing_required_skills": skills_result["missing_required"],
        "missing_preferred_skills": skills_result["missing_preferred"],
    }
