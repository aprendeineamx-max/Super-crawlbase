from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProfileTokensSchema(BaseModel):
    normal: str
    javascript: Optional[str] = None
    proxy: Optional[str] = None
    storage: Optional[str] = None


class ProfileBaseSchema(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    default_product: Optional[str] = Field(default=None, description="Producto Crawlbase predeterminado")
    tags: List[str] = Field(default_factory=list)


class ProfileCreateSchema(ProfileBaseSchema):
    token_normal: str
    token_js: Optional[str] = None
    token_proxy: Optional[str] = None
    token_storage: Optional[str] = None
    metadata: Optional[dict] = None


class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    default_product: Optional[str] = None
    tags: Optional[List[str]] = None
    token_normal: Optional[str] = None
    token_js: Optional[str] = None
    token_proxy: Optional[str] = None
    token_storage: Optional[str] = None
    metadata: Optional[dict] = None


class ProfileReadSchema(ProfileBaseSchema):
    id: int
    created_at: datetime
    updated_at: datetime
    tokens: Optional[ProfileTokensSchema] = None
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True

