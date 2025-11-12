from app.analytics.service import (
    build_dashboard_payload,
    build_usage_summary,
    DomainUsage,
    UsageSummary,
)


def sample_payload() -> dict:
    return {
        "totalSuccess": 120,
        "totalFailed": 30,
        "totalDue": 24.5,
        "remainingCredits": 880,
        "domainStats": [
            {"domain": "amazon.com", "totalRequests": 100, "success": 90, "failed": 10},
            {"domain": "walmart.com", "totalRequests": 50, "success": 30, "failed": 20},
        ],
    }


def test_build_usage_summary_basic() -> None:
    summary = build_usage_summary(sample_payload(), product="crawling-api")

    assert isinstance(summary, UsageSummary)
    assert summary.total_success == 120
    assert summary.total_failed == 30
    assert summary.total_due == 24.5
    assert summary.remaining_credits == 880
    assert summary.success_rate == 80.0
    assert summary.domains[0].domain == "amazon.com"
    assert summary.domains[0].success_rate == 90.0


def test_build_usage_summary_with_trend() -> None:
    previous = {
        "totalSuccess": 100,
        "totalFailed": 20,
        "totalDue": 20.0,
    }
    summary = build_usage_summary(sample_payload(), product="crawling-api", previous_payload=previous)

    assert summary.trend is not None
    assert summary.trend.total_success_delta == 20
    assert summary.trend.total_failed_delta == 10
    assert summary.trend.total_due_delta == 4.5


def test_dashboard_payload_structure() -> None:
    summary = build_usage_summary(sample_payload(), product="crawling-api")
    payload = build_dashboard_payload(summary)

    assert payload["product"] == "crawling-api"
    assert payload["totals"]["success"] == 120
    assert payload["series"]["status"][0]["label"] == "Éxitos"
    assert len(payload["series"]["domains"]) == 2

