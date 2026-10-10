from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import init_db
from app.routers import resume, job, analyze, chat

settings = get_settings()

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Resume parsing, job matching, ATS analysis, skill gap and roadmap generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Keep raw tracebacks out of API responses; log them server-side instead.
    print(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our end. Please try again."},
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


app.include_router(resume.router)
app.include_router(job.router)
app.include_router(analyze.router)
app.include_router(chat.router)
