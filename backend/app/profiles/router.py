from typing import Iterable, List

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.profiles import schemas
from app.profiles.service import ProfileService

router = APIRouter(prefix="/profiles", tags=["profiles"])


def get_service(session: Session = Depends(get_session)) -> ProfileService:
    return ProfileService(session=session)


@router.get("/", response_model=List[schemas.ProfileReadSchema])
def list_profiles(
    include_tokens: bool = Query(default=False, description="Incluir tokens desencriptados en la respuesta"),
    service: ProfileService = Depends(get_service),
) -> Iterable[schemas.ProfileReadSchema]:
    return service.list(include_tokens=include_tokens)


@router.get("/{profile_id}", response_model=schemas.ProfileReadSchema)
def retrieve_profile(
    profile_id: int,
    include_tokens: bool = Query(default=True, description="Incluir tokens desencriptados en la respuesta"),
    service: ProfileService = Depends(get_service),
) -> schemas.ProfileReadSchema:
    return service.get(profile_id=profile_id, include_tokens=include_tokens)


@router.post("/", response_model=schemas.ProfileReadSchema, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: schemas.ProfileCreateSchema,
    service: ProfileService = Depends(get_service),
) -> schemas.ProfileReadSchema:
    return service.create(data=payload)


@router.patch("/{profile_id}", response_model=schemas.ProfileReadSchema)
def update_profile(
    profile_id: int,
    payload: schemas.ProfileUpdateSchema,
    service: ProfileService = Depends(get_service),
) -> schemas.ProfileReadSchema:
    return service.update(profile_id=profile_id, data=payload)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: int,
    service: ProfileService = Depends(get_service),
) -> None:
    service.delete(profile_id=profile_id)

