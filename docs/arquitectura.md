## Arquitectura propuesta

El programa se concibe como una suite de escritorio modular orientada a scraping profesional sobre la plataforma Crawlbase. La solución se divide en tres capas principales que permiten iterar rápido, integrar múltiples lenguajes y escalar funcionalidades sin comprometer la mantenibilidad.

### 1. Capa de experiencia de usuario (Desktop Shell)
- **Stack:** Tauri 2 + React 18 + TypeScript + Tailwind CSS.
- **Responsabilidad:** Proporciona una interfaz nativa liviana y moderna, con pestañas por proyecto, selector de perfiles, tablero (dashboard) y vistas dedicadas por ecosistema (Amazon, Walmart, Facebook, etc.).
- **Integración:** Se comunica con el backend Python a través de un bridge HTTP/WebSocket seguro expuesto en `http://127.0.0.1:<puerto>/api`.
- **Extras:** motor de renderizado de documentación interactiva, ejecución inline de ejemplos (sandbox), componentes reutilizables (`ProfileBadge`, `UsageDonut`, `ScraperTabLayout`).

#### Componentes UI del dashboard
- `UsageStatusDonut`: gráfico circular construido con Recharts que consume `summary.series.status` para mostrar éxitos vs fallos.
- `UsageTrendCard`: tarjetón que renderiza variaciones (`summary.trend`) e indicadores de éxito.
- `DomainActivityChart`: gráfico apilado para `summary.series.domains`, disponible en modo área o barras.
- `DomainLeaderboardTable`: tabla responsiva con métricas por dominio y tooltips para tasas de éxito.
- `ProfileSelector` + `ProfileContext`: sincronizan la selección de perfil en Tauri con la consulta `GET /api/dashboard/usage`.
- `useUsageSnapshot` (hook): encapsula React Query + SWR para memoizar la respuesta del backend y soportar `force_refresh`.

### 2. Capa de orquestación y dominio (Backend Python)
- **Stack:** Python 3.11, FastAPI, SQLModel, Alembic, Typer CLI, Celery + Redis para tareas asíncronas.
- **Responsabilidad general:** Gestionar autenticación de perfiles, persistencia cifrada de tokens, flujos de scraping y composición de proyectos.
- **Módulos clave:**
  - `profiles`: CRUD de perfiles multi-suscripción, almacenamiento cifrado (Fernet) y rotación.
  - `sessions`: administra contenedores aislados estilo “Firefox Container” aplicados a cada proyecto.
  - `crawlbase`: cliente unificado para Crawling API, Smart Proxy, Crawler, Cloud Storage, Leads, Screenshots y demás productos.
  - `projects`: asociación proyecto-perfil, plantillas parametrizables, generador de enlaces (similar a Crunch/Cewl).
  - `docs`: motor de documentación embebida con ejemplos ejecutables y registros de uso.
  - `analytics`: cálculo de métricas de consumo por perfil; sirve datos al dashboard con agregados enriquecidos.
  - `tasks`: ejecución de colas (Celery) para scraping masivo y almacenamiento en formatos XLSX/CSV/Markdown.

#### Caché y resiliencia del dashboard
- `UsageSnapshotCache`: caché en memoria (TTL configurable vía `DASHBOARD_CACHE_TTL`) que evita golpear `/account` en cada refresco.
- El endpoint `/api/dashboard/usage` expone flags `cached` y `force_refresh` para invalidar la caché desde la UI.
- Manejo explícito de errores de cuota/límites: si la API devuelve `error` o `status_code >= 400` se propaga un `HTTPException` con detalle human-friendly.
- Los datos se normalizan en `UsageSummary` y se convierten en `dashboard.series` para gráficas, `dashboard.totals` para KPIs y `dashboard.trend` para variaciones.

### 3. Capa de infraestructura y extensibilidad
- **Stack:** Rust (Tauri Core), Docker Compose (ambiente opcional), GitHub Actions (CI), Dependabot.
- **Responsabilidad:** empaquetado multiplataforma, ejecución en contenedores y automatización de QA.
- **Componentes:**
  - Contenedor base con Python + Node + Rust para pipelines de build.
  - Scripts de empaquetado (MSI/DMG/AppImage) y firma de binarios.
  - Integración futura con orquestadores (Airflow, Prefect) vía webhooks.

## Gestión de perfiles y credenciales
- Almacén SQLite con cifrado simétrico (Fernet) para los tokens.
- Cada perfil contiene:
  - `nombre`, `descripcion`, `tipoSuscripcion`
  - Tokens: `token_normal`, `token_js`, `token_proxy`, `token_storage`
  - Límites de cuotas, notas y etiquetas.
- Primer perfil cargado desde `seed_data/primer_perfil.json` con las credenciales de ejemplo solicitadas.
- CLI (`python -m app.cli perfiles`) para importar/exportar perfiles y rotar credenciales.

## Flujos principales
1. **Selección de perfil** → carga dashboard con consumo de API (`GET /account`).
2. **Creación de proyecto** → se elige perfil, scraper objetivo y parámetros base.
3. **Generador de enlaces** → componentes React alimentan servicio `projects.link_factory` que admite plantillas y diccionarios, exporta a XLSX/CSV/TXT/Markdown.
4. **Ejecución de scraping** → backend encola tarea Celery con token y parámetros; resultados pueden guardarse en Cloud Storage de Crawlbase o en local.
5. **Documentación interactiva** → la UI renderiza Markdown enriquecido; el usuario puede lanzar ejemplos mediante `POST /docs/run-example`.
6. **Dashboard enriquecido** → la Shell consume `summary`, `dashboard.totals` y `dashboard.series` para alimentar las visualizaciones y animaciones.

## Persistencia y formatos soportados
- **Base de datos:** SQLite (encriptado) con migraciones Alembic.
- **Archivos de salida:** `.xlsx` (openpyxl), `.csv`, `.jsonl`, `.md`, `.txt`.
- **Configuración:** `.env` + `settings.toml` gestionados con Pydantic Settings.

## Seguridad y cumplimiento
- Tokens en repositorio sólo para QA (proveídos por el usuario). En producción se pedirá cifrado adicional con clave proporcionada durante instalación.
- Registros auditables (`audit_log`): quién ejecutó qué scraper con qué perfil.
- Modo “pasivo” para ejecutar ejemplos de documentación sin afectar cuotas reales (mock).

## Documentación interactiva y QA
- `app.docs.router` realiza inyección de tokens mediante placeholders (`{token}`, `{js_token}`, etc.) y permite overrides en tiempo de ejecución.
- Pruebas automatizadas (`test_docs_router.py`) cubren sustitución de tokens, overrides y manejo de errores 404.
- La UI cuenta con una vista “Documentación” que consume `/docs/catalog`, navega por secciones y permite ejecutar ejemplos sin salir del programa.
- Plan de mejora: registrar historial de ejemplos ejecutados y exponer snippets reutilizables en proyectos.

## Roadmap inmediato
1. Scaffold backend FastAPI + SQLModel + Typer.
2. Implementar modelo `Profile` y seed inicial con el primer perfil.
3. Exponer endpoints `/profiles`, `/projects`, `/crawlbase/*`, `/docs`.
4. Crear frontend Tauri + React con layout base, selector de perfil y pestañas de proyectos.
5. Integrar dashboard con datos reales de `GET /account`.
6. Añadir generador de enlaces parametrizado por vertical (Amazon, Walmart, etc.).
7. Documentación interna (`docs/`) y pruebas Pytest.

## Próximos pasos sugeridos
- Configurar `pre-commit` con linters (ruff, mypy, black, eslint).
- Añadir workers Celery y plan de despliegue en Windows/macOS/Linux.
- Implementar soporte offline para documentación y ejemplos simulados.

