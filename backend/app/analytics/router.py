from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.analytics.service import UsageSnapshotCache, build_dashboard_payload, build_usage_summary
from app.core.config import settings
from app.core.database import get_session
from app.crawlbase.client import CrawlbaseClient, CrawlbaseClientError
from app.profiles.schemas import ProfileReadSchema
from app.profiles.service import ProfileService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def get_profile_service(session: Session = Depends(get_session)) -> ProfileService:
    return ProfileService(session=session)


usage_cache = UsageSnapshotCache(ttl=settings.dashboard_cache_ttl)


@router.get("/usage")
def get_usage_snapshot(
    profile_id: int = Query(..., description="ID del perfil a consultar"),
    include_previous: bool = Query(False, description="Incluir estadísticas del mes anterior"),
    product: str = Query("crawling-api", description="Producto Crawlbase a consultar"),
    force_refresh: bool = Query(False, description="Ignorar el caché y forzar consulta al API"),
    service: ProfileService = Depends(get_profile_service),
):
    profile: ProfileReadSchema = service.get(profile_id=profile_id, include_tokens=True)

    cache_key = (profile.id, product, include_previous)
    if not force_refresh:
        cached = usage_cache.get(cache_key)
        if cached:
            return {**cached, "cached": True}

    try:
        with CrawlbaseClient(profile=profile) as client:
            response = client.get_account_snapshot(product=product, include_previous=include_previous)
    except CrawlbaseClientError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    payload: Dict[str, Any] = response.data if isinstance(response.data, dict) else {}

    if response.status_code >= 400 or payload.get("error"):
        detail = payload.get("message") or payload.get("error") or "Error al consultar Crawlbase"
        raise HTTPException(status_code=response.status_code, detail=detail)

    previous_payload = None
    if include_previous:
        for key in ("previousMonth", "previous_month", "previous"):
            candidate = payload.get(key)
            if isinstance(candidate, dict):
                previous_payload = candidate
                break

    summary = build_usage_summary(payload, product=product, previous_payload=previous_payload)
    dashboard = build_dashboard_payload(summary)

    result = {
        "profile": {
            "id": profile.id,
            "name": profile.name,
            "product": product,
        },
        "status_code": response.status_code,
        "summary": summary.model_dump(),
        "dashboard": dashboard,
        "raw": payload,
        "headers": response.headers,
        "cached": False,
    }

    usage_cache.set(cache_key, result)
    return result

