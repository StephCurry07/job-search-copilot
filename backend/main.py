from __future__ import annotations

import json
import os
import re
from datetime import datetime
from typing import List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Field, Session, SQLModel, create_engine, select

load_dotenv()

ALLOWED_STAGES = ["Interested", "Applied", "Interviewing", "Offer", "Rejected"]

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./jobcopilot.db")
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)


class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[str] = None
    stage: str = Field(default="Interested")
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[str] = None
    stage: Optional[str] = "Interested"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    stage: Optional[str] = None
    notes: Optional[str] = None


class JobAnalyzeRequest(BaseModel):
    job_description: str
    candidate_profile: Optional[str] = None


class JobAnalysis(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    summary: Optional[str] = None
    responsibilities: List[str]
    required_skills: List[str]
    preferred_skills: List[str]
    fit_score: int
    missing_skills: List[str]
    match_rationale: Optional[str] = None


class GenerateContentRequest(BaseModel):
    job_description: str
    candidate_profile: Optional[str] = None


class GeneratedContent(BaseModel):
    resume_bullets: List[str]
    cover_letter_paragraphs: List[str]
    talking_points: List[str]


app = FastAPI(title="Job Search Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


@app.on_event("startup")
def on_startup() -> None:
    SQLModel.metadata.create_all(engine)

@app.get("/")
def home():
    return "Welcome"

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/analyze_jd", response_model=JobAnalysis)
async def analyze_jd(payload: JobAnalyzeRequest) -> JobAnalysis:
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    llm_result = await try_llm_job_analysis(payload.job_description, payload.candidate_profile)
    if llm_result:
        return llm_result

    return heuristic_job_analysis(payload.job_description, payload.candidate_profile)


@app.post("/api/generate_content", response_model=GeneratedContent)
async def generate_content(payload: GenerateContentRequest) -> GeneratedContent:
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    llm_result = await try_llm_generate_content(payload.job_description, payload.candidate_profile)
    if llm_result:
        return llm_result

    return heuristic_generate_content(payload.job_description, payload.candidate_profile)


@app.get("/api/applications", response_model=List[Application])
def list_applications() -> List[Application]:
    with Session(engine) as session:
        return list(session.exec(select(Application).order_by(Application.updated_at.desc())))


@app.post("/api/applications", response_model=Application)
def create_application(payload: ApplicationCreate) -> Application:
    stage = payload.stage or "Interested"
    validate_stage(stage)

    with Session(engine) as session:
        app_entry = Application(
            title=payload.title,
            company=payload.company,
            location=payload.location,
            url=payload.url,
            stage=stage,
            notes=payload.notes,
        )
        session.add(app_entry)
        session.commit()
        session.refresh(app_entry)
        return app_entry


@app.patch("/api/applications/{app_id}", response_model=Application)
def update_application(app_id: int, payload: ApplicationUpdate) -> Application:
    with Session(engine) as session:
        app_entry = session.get(Application, app_id)
        if not app_entry:
            raise HTTPException(status_code=404, detail="Application not found")

        if payload.stage is not None:
            validate_stage(payload.stage)
            app_entry.stage = payload.stage
        if payload.title is not None:
            app_entry.title = payload.title
        if payload.company is not None:
            app_entry.company = payload.company
        if payload.location is not None:
            app_entry.location = payload.location
        if payload.url is not None:
            app_entry.url = payload.url
        if payload.notes is not None:
            app_entry.notes = payload.notes

        app_entry.updated_at = datetime.utcnow()
        session.add(app_entry)
        session.commit()
        session.refresh(app_entry)
        return app_entry


def validate_stage(stage: str) -> None:
    if stage not in ALLOWED_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"stage must be one of {', '.join(ALLOWED_STAGES)}",
        )


def heuristic_job_analysis(job_description: str, candidate_profile: Optional[str]) -> JobAnalysis:
    title = extract_line_value(job_description, ["title", "role", "position"]) or "Role"
    company = extract_line_value(job_description, ["company", "organization"]) or "Company"
    location = extract_line_value(job_description, ["location", "based in"]) or None
    employment_type = extract_line_value(job_description, ["employment", "type", "job type"]) or None
    salary_range = extract_salary(job_description)

    responsibilities = extract_bullets(job_description, ["responsibilities", "what you will do", "role"])
    required_skills = extract_skills(job_description)
    preferred_skills = extract_skills(job_description, preferred=True)

    candidate_skills = extract_candidate_skills(candidate_profile or "")
    matched = [skill for skill in required_skills if skill.lower() in candidate_skills]
    missing = [skill for skill in required_skills if skill.lower() not in candidate_skills]

    fit_score = 60
    if required_skills:
        fit_score = int(round((len(matched) / max(len(required_skills), 1)) * 100))

    summary = summarize_text(job_description)
    match_rationale = (
        f"Matched {len(matched)} of {len(required_skills)} required skills."
        if required_skills
        else "No explicit required skills found; used a general fit estimate."
    )

    return JobAnalysis(
        title=title,
        company=company,
        location=location,
        employment_type=employment_type,
        salary_range=salary_range,
        summary=summary,
        responsibilities=responsibilities,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        fit_score=max(0, min(100, fit_score)),
        missing_skills=missing,
        match_rationale=match_rationale,
    )


def heuristic_generate_content(job_description: str, candidate_profile: Optional[str]) -> GeneratedContent:
    skills = extract_skills(job_description)
    profile_summary = (candidate_profile or "experienced candidate").strip()
    top_skills = ", ".join(skills[:5]) if skills else "relevant skills"

    resume_bullets = [
        f"Delivered impact in {top_skills} aligned with the role requirements.",
        f"Partnered cross-functionally to drive outcomes using {top_skills}.",
        f"Improved quality and speed by applying {top_skills} best practices.",
    ]

    cover_letter_paragraphs = [
        "I am excited to apply for this role and bring a results-driven approach to your team.",
        f"My background includes {profile_summary}, and I have hands-on experience with {top_skills}.",
        "I would welcome the opportunity to contribute to your goals and discuss how I can help."
    ]

    talking_points = [
        f"Highlight experience with {top_skills} that maps to key responsibilities.",
        "Explain a recent project with measurable impact and clear business outcomes.",
        "Discuss how you adapt quickly to new domains and collaborate effectively."
    ]

    return GeneratedContent(
        resume_bullets=resume_bullets,
        cover_letter_paragraphs=cover_letter_paragraphs,
        talking_points=talking_points,
    )


async def try_llm_job_analysis(job_description: str, candidate_profile: Optional[str]) -> Optional[JobAnalysis]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    prompt = (
        "Analyze the following job description and candidate profile. "
        "Return JSON with keys: title, company, location, employment_type, salary_range, "
        "summary, responsibilities (array), required_skills (array), preferred_skills (array), "
        "fit_score (0-100), missing_skills (array), match_rationale."
    )

    user_content = f"Job description:\n{job_description}\n\nCandidate profile:\n{candidate_profile or ''}"

    raw = await call_llm_json(base_url, api_key, model, prompt, user_content)
    if not raw:
        return None

    try:
        return JobAnalysis(**raw)
    except Exception:
        return None


async def try_llm_generate_content(job_description: str, candidate_profile: Optional[str]) -> Optional[GeneratedContent]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    prompt = (
        "Generate content for a job seeker. Return JSON with keys: resume_bullets (array), "
        "cover_letter_paragraphs (array), talking_points (array)."
    )

    user_content = f"Job description:\n{job_description}\n\nCandidate profile:\n{candidate_profile or ''}"

    raw = await call_llm_json(base_url, api_key, model, prompt, user_content)
    if not raw:
        return None

    try:
        return GeneratedContent(**raw)
    except Exception:
        return None


async def call_llm_json(
    base_url: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
) -> Optional[dict]:
    url = base_url.rstrip("/") + "/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
    except Exception:
        return None

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    json_text = extract_json_block(content)
    if not json_text:
        return None

    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        return None


def extract_json_block(content: str) -> Optional[str]:
    if not content:
        return None

    code_match = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", content)
    if code_match:
        return code_match.group(1)

    brace_match = re.search(r"(\{[\s\S]*\})", content)
    if brace_match:
        return brace_match.group(1)

    return None


def extract_line_value(text: str, labels: List[str]) -> Optional[str]:
    for label in labels:
        pattern = re.compile(rf"^{label}\s*[:\-]\s*(.+)$", re.IGNORECASE | re.MULTILINE)
        match = pattern.search(text)
        if match:
            return match.group(1).strip()
    return None


def extract_salary(text: str) -> Optional[str]:
    salary_match = re.search(r"\$\s?\d{2,3}[,\d]*\s?(?:-|to)\s?\$?\s?\d{2,3}[,\d]*", text)
    if salary_match:
        return salary_match.group(0)
    return None


def extract_bullets(text: str, anchors: List[str]) -> List[str]:
    raw_lines = [line for line in text.splitlines() if line.strip()]
    bullets = [line for line in raw_lines if line.lstrip().startswith(("-", "•"))]
    if bullets:
        return [line.strip().lstrip("-• ") for line in bullets][:6]

    lines = [line.strip() for line in raw_lines]
    lower = text.lower()
    for anchor in anchors:
        idx = lower.find(anchor)
        if idx != -1:
            section = text[idx : idx + 400]
            return [line.strip("-• ") for line in section.splitlines() if line.strip()][:6]

    return [line.strip() for line in lines[:5]]


def extract_skills(text: str, preferred: bool = False) -> List[str]:
    skills_list = [
        "Python",
        "FastAPI",
        "SQL",
        "SQLAlchemy",
        "PostgreSQL",
        "SQLite",
        "React",
        "TypeScript",
        "JavaScript",
        "Next.js",
        "Node.js",
        "AWS",
        "GCP",
        "Azure",
        "Docker",
        "Kubernetes",
        "CI/CD",
        "LLM",
        "NLP",
        "REST",
        "GraphQL",
        "Tailwind",
        "Chakra",
        "MUI",
        "Figma",
        "Product",
        "Analytics",
    ]

    text_lower = text.lower()
    found = [skill for skill in skills_list if skill.lower() in text_lower]

    if preferred:
        return found[-6:]

    return found[:10]


def extract_candidate_skills(profile: str) -> set:
    tokens = re.findall(r"[a-zA-Z\+#\.]+", profile.lower())
    return set(tokens)


def summarize_text(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    return " ".join(lines[:3])

