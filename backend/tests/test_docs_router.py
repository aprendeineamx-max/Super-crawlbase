from datetime import datetime

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.crawlbase.client import CrawlbaseResponse
from app.docs.router import router as docs_router, get_profile_service
from app.profiles.schemas import ProfileReadSchema, ProfileTokensSchema


class DummyProfileService:
    def __init__(self) -> None:
        tokens = ProfileTokensSchema(normal="normal-token", javascript="js-token", proxy=None, storage=None)
        self.profile = ProfileReadSchema(
            id=1,
            name="Perfil Demo",
            description=None,
            is_active=True,
            default_product="crawling-api",
            tags=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            tokens=tokens,
            metadata=None,
        )

    def get(self, profile_id: int, include_tokens: bool = True) -> ProfileReadSchema:  # noqa: FBT002
        if profile_id != self.profile.id:
            raise ValueError("Perfil no encontrado")
        return self.profile


class DummyCrawlbaseClient:
    def __init__(self, profile: ProfileReadSchema) -> None:
        self.profile = profile
        self.last_call: dict[str, object] = {}

    def __enter__(self) -> "DummyCrawlbaseClient":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        return None

    def get(self, path: str, params: dict | None = None) -> CrawlbaseResponse:
        self.last_call = {"method": "GET", "path": path, "params": params}
        return CrawlbaseResponse(status_code=200, data={"totalSuccess": 5}, headers={})

    def post(self, path: str, data: dict | None = None) -> CrawlbaseResponse:
        self.last_call = {"method": "POST", "path": path, "params": data}
        return CrawlbaseResponse(status_code=200, data={"totalSuccess": 5}, headers={})


def create_test_app(monkeypatch) -> tuple[TestClient, DummyCrawlbaseClient]:
    app = FastAPI()
    app.include_router(docs_router, prefix="/api")
    service = DummyProfileService()
    client_holder: dict[str, DummyCrawlbaseClient] = {}

    def dependency_override():
        return service

    app.dependency_overrides[get_profile_service] = dependency_override

    def fake_client(profile: ProfileReadSchema) -> DummyCrawlbaseClient:
        instance = DummyCrawlbaseClient(profile)
        client_holder["instance"] = instance
        return instance

    monkeypatch.setattr("app.docs.router.CrawlbaseClient", fake_client)

    return TestClient(app), client_holder


def test_run_example_replaces_tokens(monkeypatch) -> None:
    api, holder = create_test_app(monkeypatch)
    response = api.post("/api/docs/run-example/crawling-api-hello-world?profile_id=1")
    assert response.status_code == 200
    payload = response.json()
    assert payload["example"]["id"] == "crawling-api-hello-world"
    cached_client = holder["instance"]
    assert cached_client.last_call["params"]["token"] == "normal-token"


def test_run_example_supports_overrides(monkeypatch) -> None:
    api, holder = create_test_app(monkeypatch)
    response = api.post(
        "/api/docs/run-example/crawling-api-post?profile_id=1",
        json={"overrides": {"url": "https://example.com"}},
    )
    assert response.status_code == 200
    cached_client = holder["instance"]
    assert cached_client.last_call["params"]["url"] == "https://example.com"


def test_run_example_not_found(monkeypatch) -> None:
    api, _ = create_test_app(monkeypatch)
    response = api.post("/api/docs/run-example/unknown?profile_id=1")
    assert response.status_code == 404

