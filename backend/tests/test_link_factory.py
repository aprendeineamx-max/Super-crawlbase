from app.link_factory.service import generate_links


def test_generate_links_walmart_custom_values() -> None:
    preset, links = generate_links(
        "walmart-serp",
        overrides={
            "keyword": ["nintendo switch"],
            "category": ["2636"],
            "page": ["1", "2"],
        },
    )

    assert preset.scraper_key == "walmart-serp"
    assert len(links) == 2
    assert all("nintendo%20switch" in link or "nintendo switch" in link for link in links)

