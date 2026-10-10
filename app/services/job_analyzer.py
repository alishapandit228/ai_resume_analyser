"""
Job description parsing.

Extracts required vs. preferred skills, experience/education requirements,
soft skills and general keywords from a pasted job description, using the
same skills taxonomy as the resume parser so the two sides can be compared
on equal terms.
"""
import re
from collections import Counter
from typing import Dict, Any, List

from app.services.parser import ALL_SKILLS, SKILLS_TAXONOMY

STOPWORDS = set("""
a an the and or but if of to in on for with without within at by from as is are
was were be been being this that these those it its into your you our we they
their will can may should must have has had do does did not no yes etc role
responsibilities requirements about company job description years experience
""".split())

PREFERRED_MARKERS = re.compile(
    r"(preferred|nice[- ]to[- ]have|good to have|bonus|plus if|is a plus)", re.I
)
REQUIRED_MARKERS = re.compile(
    r"(required|must have|mandatory|minimum qualifications|you have|you'll need)", re.I
)
EXPERIENCE_RE = re.compile(r"(\d+)\+?\s*(?:-|to)?\s*(\d+)?\s*years?", re.I)
DEGREE_RE = re.compile(
    r"(bachelor'?s?|master'?s?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|phd|degree in [a-zA-Z ]+)",
    re.I,
)
SOFT_SKILLS = set(SKILLS_TAXONOMY.get("Soft Skills", []))


def _find_skills_in(text: str) -> List[str]:
    lower = text.lower()
    found = []
    for skill in ALL_SKILLS:
        if re.search(rf"(?<![a-z0-9]){re.escape(skill)}(?![a-z0-9])", lower):
            found.append(skill)
    return sorted(set(found))


def _split_required_preferred(text: str) -> (str, str):
    """Roughly splits the JD into a 'preferred' chunk (text following a
    preferred-marker) and everything else, treated as required.

    Works on sentence-level segments rather than raw lines, so a JD pasted
    as one dense paragraph (no line breaks) still gets split correctly
    instead of the first preferred-marker flipping the *entire* text over.
    """
    # Split on newlines first, then further split long lines into sentences
    # so a single-paragraph JD doesn't collapse into one giant segment.
    segments = []
    for line in text.split("\n"):
        segments.extend(re.split(r"(?<=[.;])\s+", line))

    # Classify each sentence-level segment independently: a whole sentence
    # containing a preferred-marker ("...AWS is a plus.") is treated as
    # preferred in its entirety; a whole sentence with a required-marker (or
    # no marker at all, while a heading like "Preferred:" hasn't appeared
    # yet) is treated as required. A standalone heading ("Preferred:",
    # "Required:") flips the mode for the segments that follow it.
    preferred_segments, required_segments = [], []
    mode = "required"
    for seg in segments:
        if not seg.strip():
            continue
        is_heading = len(seg.strip()) < 20 and seg.strip().endswith(":")
        has_preferred_marker = bool(PREFERRED_MARKERS.search(seg))
        has_required_marker = bool(REQUIRED_MARKERS.search(seg))

        if has_preferred_marker and not has_required_marker:
            preferred_segments.append(seg)
            if is_heading:
                mode = "preferred"
            continue
        if has_required_marker and not has_preferred_marker:
            required_segments.append(seg)
            if is_heading:
                mode = "required"
            continue
        if is_heading:
            # Ambiguous/no-marker heading — just switch mode without
            # duplicating the heading text into the skill-search corpus.
            continue

        (preferred_segments if mode == "preferred" else required_segments).append(seg)

    return " ".join(required_segments), " ".join(preferred_segments)


def _extract_keywords(text: str, top_n: int = 25) -> List[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+.#]{2,}", text.lower())
    filtered = [w for w in words if w not in STOPWORDS and len(w) > 2]
    counts = Counter(filtered)
    return [w for w, _ in counts.most_common(top_n)]


def _extract_experience_years(text: str) -> Dict[str, Any]:
    match = EXPERIENCE_RE.search(text)
    if not match:
        return {"min_years": None, "max_years": None, "raw": None}
    min_y = int(match.group(1))
    max_y = int(match.group(2)) if match.group(2) else None
    return {"min_years": min_y, "max_years": max_y, "raw": match.group(0)}


def parse_job_description(text: str) -> Dict[str, Any]:
    required_text, preferred_text = _split_required_preferred(text)

    required_skills = _find_skills_in(required_text or text)
    preferred_skills = _find_skills_in(preferred_text)
    # Anything flagged preferred shouldn't double-count as required
    required_skills = [s for s in required_skills if s not in preferred_skills]

    all_found_skills = sorted(set(required_skills) | set(preferred_skills))
    soft_skills_found = [s for s in all_found_skills if s in SOFT_SKILLS]
    technical_required = [s for s in required_skills if s not in SOFT_SKILLS]
    technical_preferred = [s for s in preferred_skills if s not in SOFT_SKILLS]

    degree_match = DEGREE_RE.search(text)

    return {
        "required_skills": technical_required,
        "preferred_skills": technical_preferred,
        "soft_skills": soft_skills_found,
        "experience": _extract_experience_years(text),
        "education_requirement": degree_match.group(0) if degree_match else None,
        "keywords": _extract_keywords(text),
        "word_count": len(text.split()),
    }
