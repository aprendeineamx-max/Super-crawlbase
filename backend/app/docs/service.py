from __future__ import annotations

from dataclasses import asdict
from typing import Dict, List, Optional

from app.docs.catalog import DocExample, DocSection, SECTIONS


def _serialize_section(section: DocSection) -> Dict:
    return {
        "id": section.id,
        "title": section.title,
        "description": section.description,
        "children": [
            _serialize_section(child) if isinstance(child, DocSection) else asdict(child) for child in section.children
        ],
    }


def list_sections() -> List[Dict]:
    return [_serialize_section(section) for section in SECTIONS]


def find_example(example_id: str) -> Optional[DocExample]:
    def walk(section: DocSection) -> Optional[DocExample]:
        for child in section.children:
            if isinstance(child, DocSection):
                result = walk(child)
                if result:
                    return result
            elif child.id == example_id:
                return child
        return None

    for section in SECTIONS:
        result = walk(section)
        if result:
            return result
    return None

