from typing import Dict, Iterable, List, Optional

from fastapi import APIRouter, Body, HTTPException, Query, status

from app.link_factory.presets import LinkPreset, list_presets
from app.link_factory.service import LinkFactoryError, export_as_base64, generate_links

router = APIRouter(prefix="/link-factory", tags=["link-factory"])


@router.get("/presets", response_model=List[Dict[str, str]])
def presets() -> Iterable[Dict[str, str]]:
    def serialize(preset: LinkPreset) -> Dict[str, str]:
        return {
            "id": preset.id,
            "label": preset.label,
            "description": preset.description,
            "scraper_key": preset.scraper_key,
            "recommended_format": preset.recommended_format,
            "notes": preset.notes,
        }

    return [serialize(preset) for preset in list_presets()]


@router.post("/generate")
def generate(
    preset_id: str = Query(..., description="Identificador del preset de enlaces"),
    overrides: Optional[Dict[str, List[str]]] = Body(default=None, description="Valores personalizados para las variables"),
    export_format: Optional[str] = Query(
        default=None,
        description="Formato opcional de exportación (xlsx, csv, txt, md, json)",
    ),
    preview_limit: int = Query(default=25, ge=1, le=200, description="Cantidad máxima de enlaces a previsualizar"),
):
    try:
        preset, links = generate_links(preset_id=preset_id, overrides=overrides)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except LinkFactoryError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    payload = {
        "preset": {
            "id": preset.id,
            "label": preset.label,
            "scraper_key": preset.scraper_key,
            "recommended_format": preset.recommended_format,
            "notes": preset.notes,
        },
        "total": len(links),
        "preview": links[:preview_limit],
    }

    if export_format:
        try:
            payload["export"] = export_as_base64(links, export_format=export_format)
        except LinkFactoryError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return payload

