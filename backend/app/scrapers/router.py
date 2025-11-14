from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlmodel import Session

from app.core.database import get_session
from app.profiles.service import ProfileService
from app.scrapers import schemas, service

router = APIRouter(prefix="/scrapers", tags=["scrapers"])


def get_profile_service(session: Session = Depends(get_session)) -> ProfileService:
    return ProfileService(session=session)


@router.post("/scrape", response_model=schemas.ScrapeResponseSchema)
def scrape_urls_endpoint(
    payload: schemas.ScrapeRequestSchema,
    profile_service: ProfileService = Depends(get_profile_service),
) -> schemas.ScrapeResponseSchema:
    """Scrapea una lista de URLs y guarda los resultados en Excel."""
    try:
        # Obtener perfil con tokens
        profile = profile_service.get(profile_id=payload.profile_id, include_tokens=True)
        
        # Ejecutar scraping
        result = service.scrape_urls(
            urls=payload.urls,
            profile=profile,
            excel_path=payload.excel_path,
            sheet_name=payload.sheet_name,
        )
        
        return schemas.ScrapeResponseSchema(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante el scraping: {str(e)}",
        )


@router.get("/download")
def download_excel(
    path: str = Query(..., description="Ruta del archivo Excel a descargar"),
) -> FileResponse:
    """Descarga un archivo Excel generado por el scraping."""
    excel_file = Path(path)
    
    # Si la ruta no es absoluta o no existe, buscar en el directorio output
    if not excel_file.is_absolute() or not excel_file.exists():
        output_dir = Path(__file__).resolve().parents[2] / "output"
        excel_file = output_dir / excel_file.name if not excel_file.is_absolute() else excel_file
    
    if not excel_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Archivo no encontrado: {excel_file}",
        )
    
    if not excel_file.is_file():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La ruta no es un archivo válido",
        )
    
    return FileResponse(
        path=str(excel_file),
        filename=excel_file.name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

