from __future__ import annotations

import base64
import csv
from io import BytesIO, StringIO
from itertools import product
from typing import Dict, Iterable, List, Tuple

from openpyxl import Workbook

from app.link_factory.presets import LinkPreset, get_preset, list_presets


class LinkFactoryError(Exception):
    """Error general del generador de enlaces."""


def resolve_presets() -> List[LinkPreset]:
    return list_presets()


def _resolve_values(preset: LinkPreset, overrides: Dict[str, Iterable[str]]) -> Dict[str, List[str]]:
    resolved: Dict[str, List[str]] = {}
    for key, default_values in preset.variables.items():
        override = overrides.get(key)
        if override:
            resolved[key] = [str(item).strip() for item in override if str(item).strip()]
        else:
            resolved[key] = default_values
        if not resolved[key]:
            raise LinkFactoryError(f"El conjunto para '{key}' no puede quedar vacío.")
    # Permitir variables adicionales definidos por el usuario aunque no existan en el preset
    for key, values in overrides.items():
        if key not in resolved:
            resolved[key] = [str(item).strip() for item in values]
    return resolved


def generate_links(preset_id: str, overrides: Dict[str, Iterable[str]] | None = None) -> Tuple[LinkPreset, List[str]]:
    preset = get_preset(preset_id)
    overrides = overrides or {}
    values = _resolve_values(preset, overrides)

    variable_names = list(values.keys())
    combinations = product(*(values[name] for name in variable_names))

    links: List[str] = []
    for combo in combinations:
        context = dict(zip(variable_names, combo))
        try:
            links.append(preset.pattern.format(**context))
        except KeyError as exc:
            raise LinkFactoryError(
                f"Variable '{exc.args[0]}' no está definida en el preset ni en los overrides."
            ) from exc

    return preset, sorted(set(links))


def export_links(links: List[str], export_format: str) -> Tuple[str, bytes, str]:
    export_format = export_format.lower()
    if export_format == "xlsx":
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Links"
        sheet.append(["url"])
        for link in links:
            sheet.append([link])
        buffer = BytesIO()
        workbook.save(buffer)
        return ("links.xlsx", buffer.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    if export_format == "csv":
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["url"])
        for link in links:
            writer.writerow([link])
        return ("links.csv", buffer.getvalue().encode("utf-8"), "text/csv")

    if export_format == "md":
        content = "# Lista de enlaces\n\n" + "\n".join(f"- {link}" for link in links)
        return ("links.md", content.encode("utf-8"), "text/markdown")

    if export_format in {"txt", "text"}:
        content = "\n".join(links)
        return ("links.txt", content.encode("utf-8"), "text/plain")

    if export_format == "json":
        import json

        content = json.dumps({"links": links}, indent=2)
        return ("links.json", content.encode("utf-8"), "application/json")

    raise LinkFactoryError(f"Formato de exportación no soportado: {export_format}")


def export_as_base64(links: List[str], export_format: str) -> Dict[str, str]:
    filename, content, mimetype = export_links(links, export_format)
    encoded = base64.b64encode(content).decode("utf-8")
    return {
        "filename": filename,
        "mimetype": mimetype,
        "content_base64": encoded,
    }

