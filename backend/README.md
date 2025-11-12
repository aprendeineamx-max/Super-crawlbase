# Backend – Crawlbase Desktop Suite

Este backend expone todos los servicios de dominio que alimentan la aplicación de escritorio profesional para Crawlbase. Está construido con FastAPI y se encarga de orquestar perfiles multi-suscripción, proyectos y la ejecución de scrapers especializados.

## Características principales
- API REST y WebSocket para la Shell de escritorio (Tauri/React).
- Gestión cifrada de perfiles y tokens (multi-credencial).
- Integración con todos los productos de Crawlbase (Crawling API, Smart Proxy, Crawler, Cloud Storage, etc.).
- Generador de enlaces por vertical (Amazon, Walmart, Facebook, etc.).
- Motor de documentación interactiva con ejemplos ejecutables.
- Dashboard de consumo alimentado por métricas en tiempo real.

## Requisitos
- Python 3.11+
- Redis (para tareas asíncronas con Celery)
- Node 18+ y Rust (si se compila la Shell Tauri)

## Instalación rápida
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -U pip
pip install -e .
alembic upgrade head
python -m app.cli perfiles seed
uvicorn app.main:app --reload
```

## Estructura relevante
```
app/
  core/          # Configuración, seguridad, DB
  profiles/      # Modelos y servicios de perfiles
  projects/      # Gestión de proyectos y plantillas
  link_factory/  # Generación de listas de URLs
  crawlbase/     # Clientes y endpoints hacia Crawlbase
  docs/          # Documentación interactiva
  analytics/     # Métricas y dashboard
  tasks/         # Jobs asíncronos con Celery
tests/           # Pytest
seed_data/       # Datos iniciales (incluye primer perfil)
```

## Scripts CLI
```
python -m app.cli perfiles list
python -m app.cli proyectos create "Amazon BlackFriday"
python -m app.cli docs sync
```

## Próximos pasos
- Completar implementación de servicios y endpoints.
- Añadir cobertura Pytest/mypy.
- Conectar con la Shell de escritorio Tauri.

