from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import httpx

from app.profiles.schemas import ProfileReadSchema

BASE_URL = "https://api.crawlbase.com"


class CrawlbaseClientError(Exception):
    """Error base para interacciones con Crawlbase."""


@dataclass
class CrawlbaseResponse:
    status_code: int
    data: Any
    headers: Dict[str, str]


class CrawlbaseClient:
    def __init__(self, profile: ProfileReadSchema, timeout: float = 30.0) -> None:
        if not profile.tokens:
            raise CrawlbaseClientError("El perfil seleccionado no tiene tokens asociados.")
        self.profile = profile
        self.timeout = timeout
        self._client = httpx.Client(timeout=timeout)

    def _build_params(self, params: Optional[Dict[str, Any]] = None, token_override: Optional[str] = None) -> Dict[str, Any]:
        params = params.copy() if params else {}
        token = token_override or self.profile.tokens.normal
        params.setdefault("token", token)
        return params

    def get(self, path: str, params: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> CrawlbaseResponse:
        url = f"{BASE_URL}{path}"
        response = self._client.get(url, params=self._build_params(params, token_override=token))
        return CrawlbaseResponse(status_code=response.status_code, data=response.json(), headers=dict(response.headers))

    def post(self, path: str, data: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> CrawlbaseResponse:
        url = f"{BASE_URL}{path}"
        response = self._client.post(url, data=self._build_params(data, token_override=token))
        return CrawlbaseResponse(status_code=response.status_code, data=response.json(), headers=dict(response.headers))

    def get_account_snapshot(self, product: str = "crawling-api", include_previous: bool = False) -> CrawlbaseResponse:
        params = {"product": product}
        if include_previous:
            params["previous_month"] = "true"
        return self.get("/account", params=params)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "CrawlbaseClient":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

