from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, Relationship, SQLModel


class ProfileBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    is_active: bool = True
    default_product: Optional[str] = Field(default=None, description="Producto Crawlbase predeterminado")
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))


class Profile(ProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token_normal_enc: str
    token_js_enc: Optional[str] = None
    token_proxy_enc: Optional[str] = None
    token_storage_enc: Optional[str] = None
    metadata_enc: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    # projects: list["Project"] = Relationship(back_populates="profile", sa_relationship_kwargs={"lazy": "selectin"})


if TYPE_CHECKING:
    from app.projects.models import Project

