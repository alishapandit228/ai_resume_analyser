"""
Generates the "What You're Doing Well" / "What Needs Improvement" /
"Recommended Changes" sections shown on the dashboard. Purely derived from
the parsed resume + match results — never fabricates skills or metrics.
"""
from typing import Dict, Any, List

WEAK_VERB_STARTS = ("worked on", "helped with", "responsible for", "did", "involved in")


def _before_after_examples(weak_bullets: List[str]) -> List[Dict[str, str]]:
    examples = []
    for bullet in weak_bullets[:3]:
        cleaned = bullet.strip("-•* \t")
        examples.append({
            "before": cleaned,
            "after": (
                f"Rewrite with a strong action verb and, if you can verify it, a measurable "
                f"result — e.g. 'Developed {cleaned.split(' ', 1)[-1] if ' ' in cleaned else cleaned} "
                f"that improved [specific outcome] by [verifiable %].'"
            ),
            "note": "Only add a specific number if you can genuinely back it up.",
        })
    return examples


def build_recommendations(
    match_result: Dict[str, Any],
    ats_result: Dict[str, Any],
    parsed_resume: Dict[str, Any],
) -> Dict[str, Any]:
    strengths, weaknesses, recs = [], [], []

    if match_result["skills_match"] >= 70:
        strengths.append("Strong overlap between your listed skills and this job's requirements.")
    if parsed_resume.get("projects"):
        strengths.append(f"Good project diversity — {len(parsed_resume['projects'])} project(s) listed.")
    if ats_result["content_quality"]["quantifiable_achievements_found"] > 0:
        strengths.append("Some bullet points already include measurable results — keep this up.")
    if parsed_resume.get("certifications"):
        strengths.append("Relevant certifications are listed, which helps validate your skills.")
    if not strengths:
        strengths.append("Resume successfully parsed — add more detail to Skills/Projects to strengthen this analysis.")

    if match_result["missing_required_skills"]:
        weaknesses.append(
            f"Missing required skills for this role: {', '.join(match_result['missing_required_skills'][:6])}."
        )
    if ats_result["content_quality"]["quantifiable_achievements_found"] == 0:
        weaknesses.append("Project/experience descriptions lack measurable impact.")
    if not parsed_resume.get("contact", {}).get("github") and not parsed_resume.get("contact", {}).get("linkedin"):
        weaknesses.append("Missing GitHub/LinkedIn links — recruiters often check these.")
    if ats_result["content_quality"]["weak_bullet_examples"]:
        weaknesses.append("Some bullet points don't start with a strong action verb.")

    recs.append({
        "title": "Prioritize the missing required skills",
        "detail": (
            f"Focus first on: {', '.join(match_result['missing_required_skills'][:5])}."
            if match_result["missing_required_skills"] else
            "You already cover the required skills — consider picking up preferred skills next."
        ),
    })
    before_after = _before_after_examples(ats_result["content_quality"]["weak_bullet_examples"])

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recs,
        "before_after_examples": before_after,
    }
