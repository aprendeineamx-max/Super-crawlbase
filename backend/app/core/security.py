from __future__ import annotations

import base64
import os
from typing import Optional

from cryptography.fernet import Fernet

from app.core.config import settings

_cached_fernet: Optional[Fernet] = None


def _resolve_key() -> bytes:
    """
    Obtiene la clave de cifrado.

    Si no existe una clave provista por el usuario, genera una temporal basada en la secret_key.
    """
    if settings.encryption_key:
        return settings.encryption_key.encode("utf-8")

    key_seed = settings.secret_key.encode("utf-8")
    padded = base64.urlsafe_b64encode(key_seed.ljust(32, b"0")[:32])
    return padded


def get_fernet() -> Fernet:
    global _cached_fernet
    if _cached_fernet is None:
        _cached_fernet = Fernet(_resolve_key())
    return _cached_fernet


def encrypt_value(value: str) -> str:
    if not value:
        return value
    token = get_fernet().encrypt(value.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_value(value: str) -> str:
    if not value:
        return value
    data = get_fernet().decrypt(value.encode("utf-8"))
    return data.decode("utf-8")


def generate_key() -> str:
    return Fernet.generate_key().decode("utf-8")

