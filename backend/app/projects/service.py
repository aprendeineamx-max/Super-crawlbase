from __future__ import annotations

from datetime import datetime
from typing import Iterable, Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.projects import models, schemas


class ProjectService:
    def __init__(self, session: Session):
        self.session = session

    def list(self, profile_id: Optional[int] = None) -> Iterable[schemas.ProjectReadSchema]:
        query = select(models.Project)
        if profile_id is not None:
            query = query.where(models.Project.profile_id == profile_id)
        projects = self.session.exec(query).all()
        return [schemas.ProjectReadSchema.model_validate(project) for project in projects]

    def get(self, project_id: int) -> schemas.ProjectReadSchema:
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
        return schemas.ProjectReadSchema.model_validate(project)

    def create(self, data: schemas.ProjectCreateSchema) -> schemas.ProjectReadSchema:
        project = models.Project(
            name=data.name,
            description=data.description,
            scraper_key=data.scraper_key,
            status=data.status,
            settings=data.settings,
            tags=data.tags,
            output_formats=data.output_formats,
            link_blueprint=data.link_blueprint,
            profile_id=data.profile_id,
        )
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return schemas.ProjectReadSchema.model_validate(project)

    def update(self, project_id: int, data: schemas.ProjectUpdateSchema) -> schemas.ProjectReadSchema:
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")

        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return schemas.ProjectReadSchema.model_validate(project)

    def delete(self, project_id: int) -> None:
        project = self.session.get(models.Project, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyecto no encontrado")
        self.session.delete(project)
        self.session.commit()

