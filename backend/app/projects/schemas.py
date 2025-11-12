from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProjectBaseSchema(BaseModel):
    name: str
    description: Optional[str] = None
    scraper_key: str = Field(description="Identificador del scraper Crawlbase (p.ej. amazon-product-details)")
    status: str = Field(default="draft")
    settings: dict = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    output_formats: List[str] = Field(default_factory=lambda: ["xlsx"])
    link_blueprint: dict = Field(default_factory=dict)


class ProjectCreateSchema(ProjectBaseSchema):
    profile_id: int


class ProjectUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scraper_key: Optional[str] = None
    status: Optional[str] = None
    settings: Optional[dict] = None
    tags: Optional[List[str]] = None
    output_formats: Optional[List[str]] = None
    link_blueprint: Optional[dict] = None
    last_run_at: Optional[datetime] = None


class ProjectReadSchema(ProjectBaseSchema):
    id: int
    profile_id: int
    created_at: datetime
    updated_at: datetime
    last_run_at: Optional[datetime] = None

    class Config:
        from_attributes = True

