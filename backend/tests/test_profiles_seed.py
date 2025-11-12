import json
from pathlib import Path


def test_seed_file_contains_required_keys() -> None:
    seed_path = Path("backend/seed_data/primer_perfil.json")
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    for key in ("token_normal", "token_js", "token_proxy", "token_storage"):
        assert key in data and data[key], f"El seed debe contener {key}"

