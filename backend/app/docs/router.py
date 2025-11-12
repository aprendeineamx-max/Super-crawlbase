from typing import Any, Dict, Optional
from urllib.parse import parse_qsl, urlsplit

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.crawlbase.client import CrawlbaseClient, CrawlbaseClientError
from app.docs.service import find_example, list_sections
from app.profiles.schemas import ProfileReadSchema
from app.profiles.service import ProfileService

router = APIRouter(prefix="/docs", tags=["docs"])


def get_profile_service(session: Session = Depends(get_session)) -> ProfileService:
    return ProfileService(session=session)


@router.get("/catalog")
def catalog() -> Dict[str, Any]:
    return {"sections": list_sections()}


def _apply_context(value: str, context: Dict[str, str]) -> str:
    rendered = value
    for key, token in context.items():
        rendered = rendered.replace(f"{{{key}}}", token)
    return rendered


def _build_context(profile: ProfileReadSchema) -> Dict[str, str]:
    tokens = profile.tokens or {}
    return {
        "token": tokens.normal if tokens else "",
        "js_token": tokens.javascript or tokens.normal if tokens else "",
        "proxy_token": tokens.proxy or tokens.normal if tokens else "",
        "storage_token": tokens.storage or tokens.normal if tokens else "",
    }


@router.post("/run-example/{example_id}")
def run_example(
    example_id: str,
    profile_id: int = Query(..., description="Perfil con el que se ejecutará la prueba"),
    overrides: Optional[Dict[str, Any]] = Body(default=None, embed=True),
    service: ProfileService = Depends(get_profile_service),
):
    example = find_example(example_id)
    if not example:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejemplo no encontrado")

    profile: ProfileReadSchema = service.get(profile_id=profile_id, include_tokens=True)
    context = _build_context(profile)

    split = urlsplit(example.path)
    path = _apply_context(split.path or "/", context)
    params = dict(parse_qsl(split.query))
    params = {key: _apply_context(value, context) for key, value in params.items()}

    if example.sample_params:
        params.update({key: _apply_context(value, context) for key, value in example.sample_params.items()})

    if overrides:
        params.update(overrides)

    try:
        with CrawlbaseClient(profile=profile) as client:
            if example.method.upper() == "GET":
                response = client.get(path, params=params)
            elif example.method.upper() == "POST":
                response = client.post(path, data=params)
            else:
                response = client.post(path, data=params)
    except CrawlbaseClientError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "example": {
            "id": example.id,
            "title": example.title,
            "method": example.method,
            "path": path,
        },
        "request": {"params": params},
        "response": {
            "status_code": response.status_code,
            "headers": response.headers,
            "data": response.data,
        },
    }

