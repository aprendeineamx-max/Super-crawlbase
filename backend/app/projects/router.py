from typing import Iterable, List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.projects import schemas
from app.projects.service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


def get_service(session: Session = Depends(get_session)) -> ProjectService:
    return ProjectService(session=session)


@router.get("/", response_model=List[schemas.ProjectReadSchema])
def list_projects(
    profile_id: Optional[int] = Query(default=None, description="Filtrar proyectos por perfil"),
    service: ProjectService = Depends(get_service),
) -> Iterable[schemas.ProjectReadSchema]:
    return service.list(profile_id=profile_id)


@router.get("/{project_id}", response_model=schemas.ProjectReadSchema)
def get_project(
    project_id: int,
    service: ProjectService = Depends(get_service),
) -> schemas.ProjectReadSchema:
    return service.get(project_id=project_id)


@router.post("/", response_model=schemas.ProjectReadSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: schemas.ProjectCreateSchema,
    service: ProjectService = Depends(get_service),
) -> schemas.ProjectReadSchema:
    return service.create(data=payload)


@router.patch("/{project_id}", response_model=schemas.ProjectReadSchema)
def update_project(
    project_id: int,
    payload: schemas.ProjectUpdateSchema,
    service: ProjectService = Depends(get_service),
) -> schemas.ProjectReadSchema:
    return service.update(project_id=project_id, data=payload)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_service),
) -> None:
    service.delete(project_id=project_id)

