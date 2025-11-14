import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
SEED_PATH = BASE_DIR / "seed_data" / "primer_perfil.json"


def test_seed_file_contains_required_keys() -> None:
    assert SEED_PATH.exists(), f"No se encontró el seed en {SEED_PATH}"
    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    for key in ("token_normal", "token_js", "token_proxy", "token_storage"):
        assert key in data and data[key], f"El seed debe contener {key}"

