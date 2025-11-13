from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship, SQLModel


class ProjectBase(SQLModel):
    name: str = Field(index=True, max_length=120)
    description: Optional[str] = None
    scraper_key: str = Field(max_length=80, description="Identificador del scraper Crawlbase a utilizar")
    status: str = Field(default="draft", max_length=32)
    settings: dict = Field(default_factory=dict, sa_column=Column(JSON))
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    output_formats: list[str] = Field(default_factory=lambda: ["xlsx"], sa_column=Column(JSON))
    link_blueprint: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profile.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    last_run_at: Optional[datetime] = None

    profile: Mapped["Profile"] = Relationship(
        back_populates="projects",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


if TYPE_CHECKING:
    from app.profiles.models import Profile