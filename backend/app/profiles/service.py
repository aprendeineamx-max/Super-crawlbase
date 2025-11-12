from __future__ import annotations

import json
from datetime import datetime
from typing import Iterable

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import decrypt_value, encrypt_value
from app.profiles import models, schemas


def _build_tokens(profile: models.Profile) -> schemas.ProfileTokensSchema:
    return schemas.ProfileTokensSchema(
        normal=decrypt_value(profile.token_normal_enc),
        javascript=decrypt_value(profile.token_js_enc) if profile.token_js_enc else None,
        proxy=decrypt_value(profile.token_proxy_enc) if profile.token_proxy_enc else None,
        storage=decrypt_value(profile.token_storage_enc) if profile.token_storage_enc else None,
    )


def _to_schema(profile: models.Profile, include_tokens: bool = False) -> schemas.ProfileReadSchema:
    metadata = json.loads(decrypt_value(profile.metadata_enc)) if profile.metadata_enc else None
    tokens = _build_tokens(profile) if include_tokens else None
    return schemas.ProfileReadSchema(
        id=profile.id,
        name=profile.name,
        description=profile.description,
        is_active=profile.is_active,
        default_product=profile.default_product,
        tags=profile.tags or [],
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        tokens=tokens,
        metadata=metadata,
    )


class ProfileService:
    def __init__(self, session: Session):
        self.session = session

    def list(self, include_tokens: bool = False) -> Iterable[schemas.ProfileReadSchema]:
        results = self.session.exec(select(models.Profile)).all()
        return [_to_schema(profile, include_tokens=include_tokens) for profile in results]

    def get(self, profile_id: int, include_tokens: bool = True) -> schemas.ProfileReadSchema:
        profile = self.session.get(models.Profile, profile_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
        return _to_schema(profile, include_tokens=include_tokens)

    def create(self, data: schemas.ProfileCreateSchema) -> schemas.ProfileReadSchema:
        profile = models.Profile(
            name=data.name,
            description=data.description,
            is_active=data.is_active,
            default_product=data.default_product,
            tags=data.tags,
            token_normal_enc=encrypt_value(data.token_normal),
            token_js_enc=encrypt_value(data.token_js) if data.token_js else None,
            token_proxy_enc=encrypt_value(data.token_proxy) if data.token_proxy else None,
            token_storage_enc=encrypt_value(data.token_storage) if data.token_storage else None,
            metadata_enc=encrypt_value(json.dumps(data.metadata)) if data.metadata else None,
        )
        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        return _to_schema(profile, include_tokens=True)

    def update(self, profile_id: int, data: schemas.ProfileUpdateSchema) -> schemas.ProfileReadSchema:
        profile = self.session.get(models.Profile, profile_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")

        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field.startswith("token_"):
                attr = f"{field}_enc"
                if value is None:
                    setattr(profile, attr, None)
                else:
                    setattr(profile, attr, encrypt_value(value))
            elif field == "metadata":
                profile.metadata_enc = encrypt_value(json.dumps(value)) if value is not None else None
            else:
                setattr(profile, field, value)

        profile.updated_at = datetime.utcnow()
        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        return _to_schema(profile, include_tokens=True)

    def delete(self, profile_id: int) -> None:
        profile = self.session.get(models.Profile, profile_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil no encontrado")
        self.session.delete(profile)
        self.session.commit()

