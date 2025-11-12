# Crawlbase Desktop Suite (Esqueleto Inicial)

Este repositorio contiene el arranque de un programa de escritorio profesional orientado al scraping avanzado con Crawlbase. Se ha diseñado para ser extensible, multi-perfil y compatible con todas las APIs y tokens proporcionados por la plataforma.

## Componentes actuales

- **Backend (`backend/`)**: FastAPI + SQLModel para gestionar perfiles, proyectos, documentación interactiva, generador de enlaces y tablero de consumo.
- **Frontend (`frontend/`)**: Shell Tauri/React con componentes para dashboard (`StatusDonut`, `TrendCard`, `DomainTable`) y consumo directo de `summary.series`.
- **Documentación (`docs/`)**: Documento de arquitectura con la visión completa de la suite.
- **Seed de credenciales (`backend/seed_data/primer_perfil.json`)**: Perfil de prueba con los tokens compartidos por el usuario.

## Próximos módulos

- **Shell de escritorio (Tauri + React)** para ofrecer una UI moderna con pestañas por proyecto.
- **Generador de enlaces** parametrizable para cada scraper.
- **Integraciones completas** con Cloud Storage, Smart Proxy, Crawler, Leads API, Screenshots API, etc.

## Cómo empezar

1. Crear y activar un entorno virtual `python -m venv .venv`.
2. Instalar dependencias `pip install -e ./backend`.
3. Inicializar la base de datos `python -m app.cli init`.
4. Cargar el perfil de ejemplo `python -m app.cli seed`.
5. Ejecutar el servidor `uvicorn app.main:app --reload --app-dir backend`.

La API quedará disponible en `http://127.0.0.1:8000/api`.

### Frontend (opcional)
1. `cd frontend`
2. Instalar dependencias `npm install` (o usar los scripts en `frontend/scripts/`).
3. Levantar la shell `npm run dev` y conectar con el backend ya ejecutándose.

**Nota:** Los errores de TypeScript en el IDE desaparecerán automáticamente después de ejecutar `npm install`, ya que TypeScript necesita los tipos de las dependencias instaladas.

### Endpoints principales ya disponibles
- `/api/profiles` – CRUD de perfiles multi-credencial (incluye seed de ejemplo).
- `/api/projects` – Gestión de proyectos y plantillas por scraper.
- `/api/link-factory` – Presets y generación/exportación de enlaces listos para scrapear.
- `/api/docs` – Catálogo de documentación con ejemplos ejecutables contra Crawlbase.
- `/api/dashboard/usage` – Resumen enriquecido de consumo (totales, dominios, tendencias) para el perfil seleccionado.

## Documentación

Consulta `docs/arquitectura.md` para conocer la visión completa (dashboard, multi-perfiles, generador de enlaces, documentación ejecutable y más).

## Aviso sobre credenciales

Las credenciales incluidas son de muestra, tal como solicitó el usuario. Deben rotarse antes de distribuir el software en producción.

---

**Estado actual:** estructura base creada. Aún falta implementar la mayoría de los servicios de scraping, la UI de escritorio, pruebas automatizadas y los workflows de build/CI.

