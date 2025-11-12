from __future__ import annotations

import copy
from time import monotonic
from typing import Any, Dict, Iterable, Optional

from pydantic import BaseModel, Field


class DomainUsage(BaseModel):
    domain: str
    total_requests: int = 0
    success: int = 0
    failed: int = 0
    success_rate: float = 0.0


class UsageTrend(BaseModel):
    total_success_delta: int = 0
    total_failed_delta: int = 0
    total_due_delta: float = 0.0
    success_rate_delta: float = 0.0


class UsageSummary(BaseModel):
    product: str
    total_success: int = 0
    total_failed: int = 0
    total_due: float = 0.0
    remaining_credits: Optional[int] = None
    success_rate: float = 0.0
    domains: list[DomainUsage] = Field(default_factory=list)
    trend: Optional[UsageTrend] = None

    @property
    def total_requests(self) -> int:
        return self.total_success + self.total_failed


def _extract_numeric(payload: Dict[str, Any], key: str, default: float = 0.0) -> float:
    value = payload.get(key, default)
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _extract_int(payload: Dict[str, Any], key: str, default: int = 0) -> int:
    value = payload.get(key, default)
    try:
        return int(value)
    except (TypeError, ValueError):
        return int(default)


def _extract_domain_stats(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    for candidate in ("domainStats", "domain_statistics", "domain_stats", "statsByDomain", "domainUsage"):
        value = payload.get(candidate)
        if isinstance(value, list):
            return value
    return []


def _compute_success_rate(success: float, failed: float) -> float:
    total = success + failed
    if total <= 0:
        return 0.0
    return round((success / total) * 100, 2)


def _build_domain_usage(raw_domains: Iterable[Dict[str, Any]]) -> list[DomainUsage]:
    domains: list[DomainUsage] = []
    for entry in raw_domains:
        domain = str(entry.get("domain") or entry.get("name") or "desconocido")
        success = _extract_int(entry, "success")
        failed = _extract_int(entry, "failed")
        total = _extract_int(entry, "totalRequests", success + failed)
        if total <= 0:
            total = success + failed
        domains.append(
            DomainUsage(
                domain=domain,
                total_requests=total,
                success=success,
                failed=failed,
                success_rate=_compute_success_rate(success, failed),
            )
        )
    domains.sort(key=lambda item: item.total_requests, reverse=True)
    return domains


def _build_trend(current: UsageSummary, previous: Optional[UsageSummary]) -> Optional[UsageTrend]:
    if previous is None:
        return None
    return UsageTrend(
        total_success_delta=current.total_success - previous.total_success,
        total_failed_delta=current.total_failed - previous.total_failed,
        total_due_delta=round(current.total_due - previous.total_due, 2),
        success_rate_delta=round(current.success_rate - previous.success_rate, 2),
    )


def build_usage_summary(
    payload: Dict[str, Any],
    product: str,
    previous_payload: Optional[Dict[str, Any]] = None,
) -> UsageSummary:
    total_success = _extract_int(payload, "totalSuccess")
    total_failed = _extract_int(payload, "totalFailed")
    total_due = _extract_numeric(payload, "totalDue")
    remaining = payload.get("remainingCredits")
    remaining_credits = _extract_int({"remainingCredits": remaining}, "remainingCredits") if remaining is not None else None

    summary = UsageSummary(
        product=product,
        total_success=total_success,
        total_failed=total_failed,
        total_due=round(total_due, 2),
        remaining_credits=remaining_credits,
        success_rate=_compute_success_rate(total_success, total_failed),
        domains=_build_domain_usage(_extract_domain_stats(payload)),
    )

    previous_summary = None
    if previous_payload:
        previous_summary = build_usage_summary(previous_payload, product=product)
    summary.trend = _build_trend(summary, previous_summary)
    return summary


def build_dashboard_payload(summary: UsageSummary) -> Dict[str, Any]:
    return {
        "product": summary.product,
        "totals": {
            "success": summary.total_success,
            "failed": summary.total_failed,
            "due": summary.total_due,
            "remaining_credits": summary.remaining_credits,
            "success_rate": summary.success_rate,
            "total_requests": summary.total_requests,
        },
        "trend": summary.trend.model_dump() if summary.trend else None,
        "series": {
            "status": [
                {"label": "Éxitos", "value": summary.total_success},
                {"label": "Fallos", "value": summary.total_failed},
            ],
            "domains": [
                {
                    "domain": domain.domain,
                    "total_requests": domain.total_requests,
                    "success": domain.success,
                    "failed": domain.failed,
                    "success_rate": domain.success_rate,
                }
                for domain in summary.domains
            ],
        },
    }


class UsageSnapshotCache:
    """Cache en memoria para snapshots de uso del dashboard."""

    def __init__(self, ttl: int = 180):
        self.ttl = ttl
        self._store: dict[tuple[Any, ...], tuple[float, Dict[str, Any]]] = {}

    def get(self, key: tuple[Any, ...]) -> Optional[Dict[str, Any]]:
        item = self._store.get(key)
        if not item:
            return None
        timestamp, value = item
        if monotonic() - timestamp > self.ttl:
            self._store.pop(key, None)
            return None
        return copy.deepcopy(value)

    def set(self, key: tuple[Any, ...], value: Dict[str, Any]) -> None:
        self._store[key] = (monotonic(), copy.deepcopy(value))

    def clear(self) -> None:
        self._store.clear()

