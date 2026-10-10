"""
Skill gap analysis + personalized learning roadmap generation.

Every missing skill gets an importance rating, an explanation, recommended
learning topics, an estimated difficulty and a suggested practice project,
pulled from a small curated knowledge base. The roadmap groups missing
required skills into weekly blocks.
"""
from typing import Dict, Any, List

SKILL_GUIDANCE: Dict[str, Dict[str, Any]] = {
    "docker": {
        "why": "Containerization is standard for shipping and deploying applications consistently across environments.",
        "topics": ["Images & containers", "Dockerfile basics", "Docker Compose", "Volumes & networking"],
        "difficulty": "Easy-Medium",
        "project": "Containerize one of your existing projects with a Dockerfile and docker-compose.yml.",
    },
    "aws": {
        "why": "Cloud platform skills are widely required for deploying and scaling production applications.",
        "topics": ["EC2", "S3", "IAM", "Deployment basics", "Lambda"],
        "difficulty": "Medium",
        "project": "Deploy a small full-stack app to an EC2 instance with an S3-backed static frontend.",
    },
    "system design": {
        "why": "Interviewers and senior roles expect the ability to reason about scalable, reliable architectures.",
        "topics": ["APIs", "Load balancing", "Databases", "Caching", "Message queues"],
        "difficulty": "Medium-Hard",
        "project": "Design (and diagram) a URL-shortener or chat-app architecture, then implement a simplified version.",
    },
    "kubernetes": {
        "why": "Orchestrating containers at scale is a common requirement for backend/DevOps-adjacent roles.",
        "topics": ["Pods & deployments", "Services", "ConfigMaps/Secrets", "Helm basics"],
        "difficulty": "Hard",
        "project": "Deploy a multi-service app (frontend + backend + DB) to a local Minikube cluster.",
    },
    "graphql": {
        "why": "An alternative to REST that many modern APIs use for flexible client-driven data fetching.",
        "topics": ["Schemas & types", "Queries & mutations", "Resolvers"],
        "difficulty": "Easy-Medium",
        "project": "Add a GraphQL endpoint alongside your existing REST API for one resource.",
    },
    "tensorflow": {
        "why": "A leading deep learning framework commonly requested for AI/ML roles.",
        "topics": ["Tensors & layers", "Model training loop", "Saving/serving models"],
        "difficulty": "Medium-Hard",
        "project": "Train an image classifier on a small dataset and serve it via a simple API.",
    },
    "power bi": {
        "why": "A widely used BI tool for building dashboards and reports from business data.",
        "topics": ["Data modeling", "DAX basics", "Dashboards"],
        "difficulty": "Easy",
        "project": "Build a dashboard from a public dataset (e.g. sales or COVID data).",
    },
}

DEFAULT_GUIDANCE = {
    "why": "This appears in the job description and is not yet reflected in your resume.",
    "topics": ["Official documentation", "A focused hands-on tutorial", "A small practice project"],
    "difficulty": "Medium",
    "project": "Build a small project that specifically exercises this skill.",
}

IMPORTANCE_BY_SOURCE = {"required": "High", "preferred": "Medium"}


def build_skill_gap(missing_required: List[str], missing_preferred: List[str]) -> List[Dict[str, Any]]:
    items = []
    for skill in missing_required:
        g = SKILL_GUIDANCE.get(skill, DEFAULT_GUIDANCE)
        items.append({
            "skill": skill,
            "importance": IMPORTANCE_BY_SOURCE["required"],
            "why_it_matters": g["why"],
            "recommended_topics": g["topics"],
            "difficulty": g["difficulty"],
            "suggested_project": g["project"],
        })
    for skill in missing_preferred:
        g = SKILL_GUIDANCE.get(skill, DEFAULT_GUIDANCE)
        items.append({
            "skill": skill,
            "importance": IMPORTANCE_BY_SOURCE["preferred"],
            "why_it_matters": g["why"],
            "recommended_topics": g["topics"],
            "difficulty": g["difficulty"],
            "suggested_project": g["project"],
        })
    return items


def build_roadmap(skill_gap: List[Dict[str, Any]], weeks_per_skill: int = 1) -> List[Dict[str, Any]]:
    """Groups skill-gap items (highest importance first) into weekly blocks."""
    ordered = sorted(skill_gap, key=lambda s: 0 if s["importance"] == "High" else 1)
    roadmap = []
    for i, item in enumerate(ordered, start=1):
        roadmap.append({
            "week": i,
            "title": f"{item['skill'].title()} fundamentals",
            "topics": item["recommended_topics"],
        })
    return roadmap
