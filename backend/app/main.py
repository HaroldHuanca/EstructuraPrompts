from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.base import Base
from app.database.connection import engine
from app.models import experiment, problem, result, technique  # noqa: F401
from app.routes.experiment_routes import router as experiment_router
from app.routes.problem_routes import router as problem_router
from app.routes.result_routes import router as result_router
from app.routes.technique_routes import router as technique_router

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(problem_router, prefix=settings.api_prefix)
app.include_router(technique_router, prefix=settings.api_prefix)
app.include_router(experiment_router, prefix=settings.api_prefix)
app.include_router(result_router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Investigacion API running"}
