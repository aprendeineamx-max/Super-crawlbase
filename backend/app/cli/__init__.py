"""CLI basada en Typer para administrar la suite."""

import json
from pathlib import Path

import typer
from rich import print

from app.core.config import settings
from app.core.database import init_db, session_scope
from app.profiles.schemas import ProfileCreateSchema
from app.profiles.service import ProfileService
from app.projects.service import ProjectService

cli = typer.Typer(help="Herramientas de línea de comando para Crawlbase Desktop")


@cli.command()
def init() -> None:
    """Inicializa la base de datos."""
    init_db()
    print("[bold green]Base de datos inicializada correctamente.[/bold green]")


@cli.command()
def seed(perfil: Path = typer.Option(None, help="Ruta alternativa al seed de perfil")) -> None:
    """Carga el perfil de ejemplo provisto en seed_data."""
    init_db()
    seed_path = perfil or Path(settings.default_profile_seed_path)
    if not seed_path.exists():
        raise typer.BadParameter(f"No se encontró el archivo de seed en {seed_path}")

    data = json.loads(seed_path.read_text(encoding="utf-8"))
    schema = ProfileCreateSchema(**data)

    with session_scope() as session:
        service = ProfileService(session)
        result = service.create(schema)
        print(f"[bold green]Perfil '{result.name}' creado con ID {result.id}[/bold green]")


@cli.command()
def perfiles() -> None:
    """Lista los perfiles registrados."""
    init_db()
    with session_scope() as session:
        service = ProfileService(session)
        profiles = service.list(include_tokens=False)
        if not profiles:
            print("[bold yellow]No hay perfiles registrados.[/bold yellow]")
            return
        for profile in profiles:
            print(f"[cyan]{profile.id}[/cyan] - {profile.name} ({profile.default_product})")


@cli.command()
def proyectos(perfil: int = typer.Option(None, help="Filtra proyectos por ID de perfil")) -> None:
    """Lista proyectos existentes."""
    init_db()
    with session_scope() as session:
        service = ProjectService(session)
        projects = service.list(profile_id=perfil)
        if not projects:
            print("[bold yellow]No hay proyectos registrados.[/bold yellow]")
            return
        for project in projects:
            print(
                f"[magenta]{project.id}[/magenta] - {project.name} "
                f"(perfil: {project.profile_id}, scraper: {project.scraper_key}, estado: {project.status})"
            )


if __name__ == "__main__":
    cli()

