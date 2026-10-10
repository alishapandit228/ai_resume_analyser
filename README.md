# Resolve — AI Resume Analyzer & Job Matching Platform

Resolve analyzes a resume against a real job description and turns the gap
between them into a concrete, week-by-week improvement plan — an ATS
compatibility score, a skills/experience/education/project match breakdown,
a prioritized skill gap list, and a personalized learning roadmap.

> **Disclaimer:** All scores are AI-generated compatibility estimates, not
> hiring predictions. The app never fabricates resume content — every
> extracted fact comes from the resume itself; suggestions are always
> labeled as suggestions.

---

## Features

- **Resume parsing** (PDF/DOCX) — contact info, education, categorized
  skills, experience, projects, certifications, achievements
- **Job description analysis** — required vs. preferred skills, experience/
  education requirements, keywords
- **Resume ↔ job matching** — TF-IDF/cosine similarity + weighted rule-based
  scoring across skills, experience, education, projects and keywords
- **ATS dashboard** — keyword coverage, formatting red flags, action-verb
  and quantifiable-achievement checks
- **Skill gap analysis** — per-skill importance, rationale, learning topics,
  difficulty, and a suggested practice project
- **Personalized learning roadmap** — weekly plan with progress tracking
- **Resume improvement suggestions** — strengths, weaknesses, before/after
  bullet-point rewrites
- **Job matching dashboard** — save multiple job descriptions, sort by
  match/company
- **Analysis history** — track how your score changes over time
- **AI chat assistant** — optional LLM-powered Q&A grounded only in your
  resume + job description (works with a canned fallback message if no LLM
  key is configured)
- **Demo mode** — explore the whole app with a realistic sample resume/job,
  no upload required

---

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, Tailwind CSS, Recharts, Lucide icons |
| Backend   | Python, FastAPI, Pydantic |
| Database  | PostgreSQL (production) / SQLite (local dev, default) |
| NLP       | TF-IDF + cosine similarity (scikit-learn), regex/keyword extraction |
| LLM (opt.)| Modular provider layer — Anthropic or OpenAI, swappable, off by default |

---

## Architecture

```
Resume Upload (PDF/DOCX)
        │
        ▼
  Text Extraction  ──────────────┐
        │                        │
        ▼                        ▼
  Resume Parsing          Job Description Parsing
  (contact, education,    (required/preferred skills,
   skills, experience,     experience, education,
   projects, certs)        keywords)
        │                        │
        └───────────┬────────────┘
                     ▼
         Skill Extraction + Semantic
         Similarity (TF-IDF/cosine)
                     │
                     ▼
            Skill Gap Analysis
                     │
                     ▼
             ATS Analysis
                     │
                     ▼
     Recommendations + Roadmap Generation
                     │
                     ▼
              Final Analysis (JSON)
                     │
                     ▼
                 Dashboard
```

The pipeline is fully modular: `app/services/parser.py`,
`app/services/job_analyzer.py`, `app/services/matcher.py`, `app/services/ats.py`,
`app/services/skill_gap.py`, and `app/services/recommendations.py` each do one
job and can be swapped or extended independently. `app/services/llm_client.py`
isolates the optional LLM provider
so switching from Anthropic to OpenAI (or adding a new provider) touches one
file.

---

## Project structure

```
ai_resume_analyser/
├── app/
│   ├── main.py                  # FastAPI app, CORS, startup
│   ├── config.py                # environment-based settings
│   ├── database.py              # SQLAlchemy engine/session
│   ├── models.py                # ORM models
│   ├── schemas.py               # Pydantic request/response models
│   ├── routers/                 # resume, job, analyze, chat
│   ├── services/                # parsing, matching, ATS, recommendations
│   └── data/skills_taxonomy.json
├── src/
│   ├── pages/
│   ├── components/
│   ├── context/AppContext.jsx
│   └── api/client.js
├── tests/
├── package.json
└── requirements.txt
```

---

## Installation

### Backend (Terminal 1)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`). SQLite is used automatically — no database
setup required for local development.

### Frontend (Terminal 2)

```powershell
npm install
npm run dev
```

Run both sets of commands from the project root, keeping both terminals open.
Open `http://localhost:5173` for the app. The Vite dev server proxies `/api`
requests to `http://localhost:8000` (see `vite.config.js`).

### Try it immediately

Click **"Try Demo"** on the landing page or Job Matcher page to run the full
pipeline against a realistic sample resume and job description — no upload
needed.

---

## Environment variables

| Variable | Default | Description |
|----------|---------|--------------|
| `DATABASE_URL` | `sqlite:///./resume_analyzer.db` | SQLAlchemy connection string. Swap in a `postgresql://...` URL for production. |
| `LLM_PROVIDER` | `none` | `none` \| `anthropic` \| `openai`. Only affects the AI Chat Assistant. |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | *(empty)* | Required only if `LLM_PROVIDER` is set. Kept server-side, never sent to the frontend. |
| `LLM_MODEL` | `claude-sonnet-4-6` | Model name passed to the chosen provider. |
| `UPLOAD_DIR` | `./uploads` | Where resume files are stored on disk. |
| `MAX_UPLOAD_MB` | `5` | Max resume file size. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins. |
| `APP_API_KEY` | *(empty)* | Optional simple API key gate; disabled when empty. |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resume/upload` | Upload + parse a PDF/DOCX resume |
| GET | `/api/resume/list` | List all uploaded resume versions |
| GET | `/api/resume/{id}` | Get one resume's parsed data |
| DELETE | `/api/resume/{id}` | Delete a resume + its file + analyses |
| POST | `/api/job/analyze` | Parse & save a job description |
| GET | `/api/job/list` | List saved job descriptions |
| GET | `/api/job/{id}` | Get one job description's parsed data |
| POST | `/api/analyze/match` | Run the full matching pipeline for a resume+job pair |
| GET | `/api/analysis/{id}` | Fetch a saved analysis result |
| GET | `/api/analysis/history/all` | List all past analyses (for the history dashboard) |
| PATCH | `/api/analysis/{id}/roadmap-progress` | Mark a roadmap week complete/incomplete |
| POST | `/api/demo/run` | Run the pipeline on the built-in demo resume + job |
| POST | `/api/chat/` | Ask the AI assistant a question grounded in resume + job context |
| GET | `/api/health` | Health check |

---

## Database schema (summary)

- **users** — optional user profile (auth is out of scope for the demo)
- **resumes** — label, original filename, file path, raw text, parsed JSON
- **job_descriptions** — title, company, raw text, parsed JSON
- **analyses** — resume_id, job_id, all sub-scores, and a `result_json` blob
  containing matched/missing skills, ATS detail, strengths/weaknesses,
  recommendations, skill gap, and roadmap

---

## Testing

```bash
pytest tests -v
```

Run from the project root after installing the Python requirements.

Covers resume parsing (contact/skills/project extraction) and the matching
engine (score ranges, matched/missing skill detection).

---

## Security & privacy notes

- File type and size are validated before any parsing happens
- API keys are read from environment variables and never sent to the browser
- Users can delete any uploaded resume (and its file + analyses) from Settings
- Full resume text is stored to power analysis, but nothing beyond what's
  needed for that is logged
- The app clearly labels every score as an *estimate* for the user to review

---

## Future improvements

- Real authentication (OAuth/JWT) instead of the placeholder `User` model
- Async resume parsing with a background job queue for large files
- Fine-tuned/embedding-based semantic matching in addition to TF-IDF
- OCR fallback for scanned/image-based PDFs
- Multi-resume, multi-job batch comparison view
- Exportable PDF report of a given analysis

---

## Resume project description

Suggested resume bullet points for this project (edit to match what you
actually built and can verify):

- Built a full-stack AI resume analyzer (React/Vite + FastAPI) that parses
  resumes and job descriptions and computes a weighted compatibility score
  using TF-IDF/cosine similarity and rule-based skill matching.
- Designed a modular NLP pipeline (parsing → matching → ATS analysis →
  skill-gap analysis → roadmap generation) with a pluggable LLM layer for
  an optional AI chat assistant.
- Implemented an ATS-style scoring dashboard with keyword coverage,
  formatting checks, and content-quality analysis, plus a personalized,
  progress-tracked learning roadmap for closing identified skill gaps.
