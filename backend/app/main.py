from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.analytics.router import router as analytics_router
from app.core.config import settings
from app.core.database import init_db
from app.docs.router import router as docs_router
from app.link_factory.router import router as link_factory_router
from app.profiles.router import router as profiles_router
from app.projects.router import router as projects_router
from app.scrapers.router import router as scrapers_router


def create_application() -> FastAPI:
    app = FastAPI(
        title="Crawlbase Desktop Backend",
        version=__version__,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redoc_url="/api/redoc",
    )

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health", tags=["monitoring"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    app.include_router(profiles_router, prefix="/api")
    app.include_router(analytics_router, prefix="/api")
    app.include_router(docs_router, prefix="/api")
    app.include_router(projects_router, prefix="/api")
    app.include_router(link_factory_router, prefix="/api")
    app.include_router(scrapers_router, prefix="/api")

    return app


app = create_application()

