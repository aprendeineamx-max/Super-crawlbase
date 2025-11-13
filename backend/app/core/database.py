from contextlib import contextmanager
import json
import logging
from pathlib import Path
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.core.security import encrypt_value
from app.profiles.models import Profile

logger = logging.getLogger(__name__)

engine = create_engine(settings.sync_database_url, echo=False, connect_args={"check_same_thread": False})


def init_db() -> None:
    """Crea las tablas necesarias en la base de datos y garantiza el perfil demo."""
    SQLModel.metadata.create_all(bind=engine)
    _ensure_default_profile()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _ensure_default_profile() -> None:
    """Carga o crea el perfil demo definido en seed_data."""
    seed_path = Path(settings.default_profile_seed_path)
    if not seed_path.is_absolute():
        base_dir = Path(__file__).resolve().parents[2]
        seed_path = base_dir / seed_path
    if not seed_path.exists():
        logger.warning("Archivo de seed para el perfil demo no encontrado en %s", seed_path)
        return

    try:
        payload = json.loads(seed_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        logger.error("No se pudo leer el seed de perfiles: %s", exc)
        return

    required_fields = {"name", "token_normal"}
    if not required_fields.issubset(payload):
        logger.error("El seed del perfil demo no contiene los campos requeridos: %s", required_fields)
        return

    with Session(engine) as session:
        existing = session.exec(select(Profile).where(Profile.name == payload["name"])).first()

        if existing:
            logger.info("Perfil demo '%s' ya existe con ID %s", existing.name, existing.id)
            return

        profile = Profile(
            name=payload["name"],
            description=payload.get("description"),
            is_active=payload.get("is_active", True),
            default_product=payload.get("default_product"),
            tags=payload.get("tags", []),
            token_normal_enc=encrypt_value(payload["token_normal"]),
            token_js_enc=encrypt_value(payload["token_js"]) if payload.get("token_js") else None,
            token_proxy_enc=encrypt_value(payload["token_proxy"]) if payload.get("token_proxy") else None,
            token_storage_enc=encrypt_value(payload["token_storage"]) if payload.get("token_storage") else None,
            metadata_enc=encrypt_value(json.dumps(payload["metadata"])) if payload.get("metadata") else None,
        )

        session.add(profile)
        session.commit()
        logger.info("Perfil demo '%s' creado con ID %s", profile.name, profile.id)

