from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ScrapeRequestSchema(BaseModel):
    urls: List[str] = Field(..., description="Lista de URLs a scrapear")
    profile_id: int = Field(..., description="ID del perfil con credenciales")
    excel_path: Optional[str] = Field(None, description="Ruta del archivo Excel (opcional, si no se proporciona se crea uno nuevo)")
    sheet_name: Optional[str] = Field(None, description="Nombre de la hoja (opcional, si no se proporciona se genera automáticamente)")


class ScrapeResponseSchema(BaseModel):
    success: bool
    total_urls: int
    successful: int
    failed: int
    excel_path: str
    sheet_name: str
    message: str
    errors: Optional[List[Dict[str, Any]]] = None

