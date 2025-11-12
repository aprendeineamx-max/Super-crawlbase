from app.analytics.service import UsageSnapshotCache


def test_usage_cache_returns_independent_copies(monkeypatch) -> None:
    tick = {"value": 0.0}

    def fake_monotonic() -> float:
        return tick["value"]

    monkeypatch.setattr("app.analytics.service.monotonic", fake_monotonic)

    cache = UsageSnapshotCache(ttl=10)
    cache.set(("profile", 1), {"value": 42})

    result_a = cache.get(("profile", 1))
    assert result_a == {"value": 42}
    result_a["value"] = 0

    result_b = cache.get(("profile", 1))
    assert result_b == {"value": 42}


def test_usage_cache_expires_entries(monkeypatch) -> None:
    tick = {"value": 0.0}

    def fake_monotonic() -> float:
        return tick["value"]

    monkeypatch.setattr("app.analytics.service.monotonic", fake_monotonic)

    cache = UsageSnapshotCache(ttl=2)
    cache.set(("profile", 1), {"value": 42})

    assert cache.get(("profile", 1)) is not None

    tick["value"] = 3.0
    assert cache.get(("profile", 1)) is None

