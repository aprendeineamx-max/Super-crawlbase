from app.docs.catalog import SECTIONS


def test_catalog_contains_all_main_sections() -> None:
    section_ids = {section.id for section in SECTIONS}
    expected = {
        "crawling-api",
        "scrapers",
        "proxy-mode",
        "try-api",
        "product-suite",
    }
    assert expected.issubset(section_ids)

