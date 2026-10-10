"""
ATS (Applicant Tracking System) compatibility analysis.

Checks keyword coverage, formatting red flags, and content quality signals
(action verbs, quantifiable achievements). This is heuristic, not a real ATS
engine, and is presented to the user as such.
"""
import re
from typing import Dict, Any, List

ACTION_VERBS = {
    "developed", "built", "designed", "implemented", "led", "created", "optimized",
    "improved", "automated", "launched", "deployed", "architected", "reduced",
    "increased", "managed", "coordinated", "mentored", "analyzed", "engineered",
    "delivered", "streamlined", "spearheaded", "collaborated", "integrated",
}
QUANT_RE = re.compile(r"\b\d+(\.\d+)?\s*(%|percent|x|hrs|hours|users|ms|seconds|days|k|million)\b", re.I)
LONG_PARAGRAPH_THRESHOLD = 500  # characters, no line breaks
UNUSUAL_SYMBOLS_RE = re.compile(r"[★☆✦❖▶◆]")


def _keyword_coverage(resume_text: str, job_keywords: List[str]) -> Dict[str, Any]:
    lower = resume_text.lower()
    present, missing, freq = [], [], {}
    for kw in job_keywords:
        count = len(re.findall(rf"(?<![a-z0-9]){re.escape(kw)}(?![a-z0-9])", lower))
        if count > 0:
            present.append(kw)
            freq[kw] = count
        else:
            missing.append(kw)
    coverage_pct = round((len(present) / len(job_keywords)) * 100, 1) if job_keywords else 100.0
    return {
        "present_keywords": present,
        "missing_keywords": missing,
        "keyword_frequency": freq,
        "coverage_percent": coverage_pct,
    }


def _formatting_issues(resume_text: str, parsed: Dict[str, Any]) -> List[str]:
    issues = []
    if not parsed.get("contact", {}).get("email"):
        issues.append("No email address detected — recruiters and ATS systems may not be able to contact you.")
    if not parsed.get("contact", {}).get("phone"):
        issues.append("No phone number detected.")
    if UNUSUAL_SYMBOLS_RE.search(resume_text):
        issues.append("Unusual symbols/icons detected — some ATS parsers may misread these as garbled text.")
    for para in resume_text.split("\n\n"):
        if "\n" not in para.strip() and len(para) > LONG_PARAGRAPH_THRESHOLD:
            issues.append("Very long unbroken paragraph detected — break into bullet points for readability.")
            break
    if "|" in resume_text and resume_text.count("|") > 15:
        issues.append("Heavy use of tables/pipe-separated columns detected — some ATS parsers struggle with tables.")
    if not parsed.get("skills"):
        issues.append("No clearly labeled Skills section detected.")
    if not parsed.get("experience") and not parsed.get("projects"):
        issues.append("No Experience or Projects section detected.")
    return issues


def _content_quality(resume_text: str, parsed: Dict[str, Any]) -> Dict[str, Any]:
    lower = resume_text.lower()
    words = re.findall(r"[a-z]+", lower)
    verbs_used = sorted({w for w in words if w in ACTION_VERBS})
    quant_matches = QUANT_RE.findall(resume_text)

    bullet_lines = [l for l in resume_text.split("\n") if l.strip().startswith(("-", "•", "*"))]
    weak_bullets = [
        b for b in bullet_lines
        if not any(v in b.lower() for v in ACTION_VERBS) and len(b.strip()) > 5
    ]

    return {
        "action_verbs_found": verbs_used,
        "action_verb_count": len(verbs_used),
        "quantifiable_achievements_found": len(quant_matches),
        "weak_bullet_examples": weak_bullets[:5],
    }


def analyze_ats(resume_text: str, parsed: Dict[str, Any], job_keywords: List[str]) -> Dict[str, Any]:
    keyword_result = _keyword_coverage(resume_text, job_keywords)
    formatting_issues = _formatting_issues(resume_text, parsed)
    content = _content_quality(resume_text, parsed)

    # Composite ATS score: keyword coverage (50%), formatting cleanliness (25%),
    # content quality signals (25%).
    formatting_score = max(0, 100 - len(formatting_issues) * 15)
    content_score = min(100, content["action_verb_count"] * 8 + content["quantifiable_achievements_found"] * 10)

    ats_score = round(
        keyword_result["coverage_percent"] * 0.5 + formatting_score * 0.25 + content_score * 0.25, 1
    )

    recommendations = []
    if keyword_result["missing_keywords"]:
        recommendations.append(
            f"Consider naturally incorporating these keywords from the job description if genuinely applicable: "
            f"{', '.join(keyword_result['missing_keywords'][:8])}."
        )
    if content["quantifiable_achievements_found"] == 0:
        recommendations.append(
            "Add measurable results to your bullet points (e.g. '...reduced load time by 30%') "
            "only where you can verify the number."
        )
    if content["action_verb_count"] < 5:
        recommendations.append("Start more bullet points with strong action verbs (Developed, Led, Optimized...).")
    recommendations.extend(formatting_issues)

    return {
        "ats_score": min(ats_score, 100.0),
        "keyword_analysis": keyword_result,
        "formatting_issues": formatting_issues,
        "content_quality": content,
        "recommendations": recommendations,
    }
