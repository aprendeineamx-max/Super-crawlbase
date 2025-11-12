from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(frozen=True)
class LinkPreset:
    id: str
    label: str
    description: str
    scraper_key: str
    pattern: str
    variables: Dict[str, List[str]] = field(default_factory=dict)
    recommended_format: str = "xlsx"
    notes: str = ""


PRESETS: Dict[str, LinkPreset] = {
    "amazon-serp": LinkPreset(
        id="amazon-serp",
        label="Amazon SERP",
        description="Genera URLs de búsqueda de productos en Amazon.",
        scraper_key="amazon-serp",
        pattern="https://www.amazon.com/s?k={keyword}&page={page}",
        variables={
            "keyword": ["best sellers", "prime deals"],
            "page": ["1", "2", "3"],
        },
        notes="Para grandes listados se recomienda exportar a XLSX y segmentar por páginas.",
    ),
    "walmart-serp": LinkPreset(
        id="walmart-serp",
        label="Walmart SERP",
        description="Búsquedas estructuradas por palabras clave y departamentos.",
        scraper_key="walmart-serp",
        pattern="https://www.walmart.com/search?q={keyword}&cat_id={category}&page={page}",
        variables={
            "keyword": ["laptop", "smartphone"],
            "category": ["3944", "3944_1229626"],
            "page": ["1", "2"],
        },
        notes="El parámetro cat_id corresponde al departamento de Walmart.",
    ),
    "facebook-page": LinkPreset(
        id="facebook-page",
        label="Facebook Page",
        description="Enlaces directos a páginas públicas de Facebook.",
        scraper_key="facebook-page",
        pattern="https://www.facebook.com/{page_slug}",
        variables={"page_slug": ["Meta", "Walmart", "IKEAUSA"]},
        recommended_format="md",
        notes="Ideal para guardar en Markdown y añadir notas manualmente.",
    ),
    "instagram-hashtag": LinkPreset(
        id="instagram-hashtag",
        label="Instagram Hashtag",
        description="Genera URLs de hashtags populares.",
        scraper_key="instagram-hashtag",
        pattern="https://www.instagram.com/explore/tags/{hashtag}/",
        variables={"hashtag": ["handmade", "fashion", "technews"]},
        recommended_format="txt",
    ),
    "google-serp": LinkPreset(
        id="google-serp",
        label="Google SERP",
        description="Consultas estructuradas de Google.",
        scraper_key="google-serp",
        pattern="https://www.google.com/search?q={keyword}+site:{domain}",
        variables={
            "keyword": ["código promocional", "reseñas"],
            "domain": ["amazon.com", "walmart.com"],
        },
        notes="Respeta las políticas de Google; combina keywords con dominios específicos.",
    ),
    "tiktok-profile": LinkPreset(
        id="tiktok-profile",
        label="TikTok Profile",
        description="Perfiles de TikTok basados en slugs parametrizados.",
        scraper_key="tiktok-profile",
        pattern="https://www.tiktok.com/@{username}",
        variables={"username": ["nike", "liverpoolfc", "google"]},
        recommended_format="csv",
    ),
    "aliexpress-product": LinkPreset(
        id="aliexpress-product",
        label="AliExpress Product",
        description="Productos de AliExpress basados en IDs.",
        scraper_key="aliexpress-product",
        pattern="https://www.aliexpress.com/item/{product_id}.html",
        variables={"product_id": ["1005008227636051", "1005006243252878"]},
        notes="Los IDs se pueden obtener desde listados SERP.",
    ),
    "bing-serp": LinkPreset(
        id="bing-serp",
        label="Bing SERP",
        description="Consultas de Bing orientadas a e-commerce.",
        scraper_key="bing-serp",
        pattern="https://www.bing.com/search?q={keyword}+intitle:{intitle}",
        variables={
            "keyword": ["comprar online", "mejor precio"],
            "intitle": ["rebajas", "opiniones"],
        },
    ),
    "bestbuy-product-details": LinkPreset(
        id="bestbuy-product-details",
        label="BestBuy Product",
        description="Detalle de productos BestBuy mediante SKU.",
        scraper_key="bestbuy-product-details",
        pattern="https://www.bestbuy.com/site/{slug}/{sku}.p",
        variables={
            "slug": ["meta-quest-3-512gb-the-most-powerful-quest-ultimate-mixed-reality-experiences-get-batman-arkham-shadow-white"],
            "sku": ["6596938"],
        },
    ),
    "eventbrite-events-list": LinkPreset(
        id="eventbrite-events-list",
        label="Eventbrite Events",
        description="Listado de eventos por ciudad y temática.",
        scraper_key="eventbrite-events-list",
        pattern="https://www.eventbrite.com/d/{country_code}--{city}/{topic}/?page={page}",
        variables={
            "country_code": ["us", "mx"],
            "city": ["new-york", "mexico-city"],
            "topic": ["ai", "marketing"],
            "page": ["1", "2"],
        },
        notes="Recomendado exportar a XLSX para filtrar por ciudad y temática.",
    ),
    "generic-extractor": LinkPreset(
        id="generic-extractor",
        label="Extractor genérico",
        description="Construcción libre de URLs mediante plantillas básicas.",
        scraper_key="generic-extractor",
        pattern="{base_url}",
        variables={"base_url": ["https://example.org", "https://news.ycombinator.com"]},
        recommended_format="txt",
    ),
}


def list_presets() -> List[LinkPreset]:
    return list(PRESETS.values())


def get_preset(preset_id: str) -> LinkPreset:
    preset = PRESETS.get(preset_id)
    if not preset:
        raise KeyError(f"No existe un preset con id {preset_id}")
    return preset

