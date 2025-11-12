from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class DocExample:
    id: str
    title: str
    method: str
    path: str
    description: str
    sample_params: Dict[str, str] = field(default_factory=dict)
    notes: Optional[str] = None


@dataclass
class DocSection:
    id: str
    title: str
    description: str
    children: List[DocExample | "DocSection"] = field(default_factory=list)


SECTIONS: List[DocSection] = [
    DocSection(
        id="crawling-api",
        title="Crawling API",
        description="Fundamentos y ejemplos del producto principal de Crawlbase.",
        children=[
            DocSection(
                id="crawling-api-intro",
                title="La API de rastreo en minutos",
                description="Resumen rápido para realizar la primera solicitud con la Crawling API.",
                children=[
                    DocExample(
                        id="crawling-api-hello-world",
                        title="Solicitud básica",
                        method="GET",
                        path="/?token={token}&url=https://example.org",
                        description="Recupera el HTML de una página usando token normal.",
                    )
                ],
            ),
            DocSection(
                id="headless-browsers",
                title="Navegadores sin interfaz gráfica",
                description="Uso de navegadores headless para renderizar contenido dinámico.",
                children=[
                    DocExample(
                        id="crawling-api-javascript",
                        title="Solicitud con token JS",
                        method="GET",
                        path="/?token={js_token}&url=https://example.org",
                        description="Ejecuta JavaScript para obtener contenido dinámico.",
                    )
                ],
            ),
            DocSection(
                id="parameters",
                title="Parámetros",
                description="Listado de parámetros más utilizados.",
                children=[
                    DocExample(
                        id="crawling-api-parameters",
                        title="Parámetros comunes",
                        method="GET",
                        path="/?token={token}&url={url}&device=desktop&geolocation=us",
                        description="Ejemplo con parámetros de geolocalización y dispositivo.",
                    )
                ],
            ),
            DocSection(
                id="responses",
                title="Respuesta",
                description="Estructura de las respuestas de la API.",
                children=[
                    DocExample(
                        id="crawling-api-response",
                        title="Inspección de respuesta",
                        method="GET",
                        path="/?token={token}&url=https://example.org&format=json",
                        description="Solicita respuesta en formato JSON para inspección.",
                    )
                ],
            ),
            DocSection(
                id="post-requests",
                title="Solicitudes POST",
                description="Cómo realizar solicitudes POST con Crawlbase.",
                children=[
                    DocExample(
                        id="crawling-api-post",
                        title="POST con payload",
                        method="POST",
                        path="/",
                        description="Envía datos utilizando la Crawling API.",
                        sample_params={"token": "{token}", "url": "https://httpbin.org/post", "post_data": "foo=bar"},
                    )
                ],
            ),
            DocSection(
                id="put-requests",
                title="Solicitudes PUT",
                description="Uso de verbos PUT en Crawling API.",
                children=[
                    DocExample(
                        id="crawling-api-put",
                        title="PUT de ejemplo",
                        method="PUT",
                        path="/",
                        description="Realiza una solicitud PUT simulada.",
                        sample_params={"token": "{token}", "url": "https://httpbin.org/put", "post_data": "foo=bar"},
                    )
                ],
            ),
            DocSection(
                id="data-scrapers",
                title="Extractores de datos",
                description="Colección completa de scrapers especializados.",
                children=[],
            ),
        ],
    ),
    DocSection(
        id="scrapers",
        title="Scrapers específicos",
        description="Listado por plataforma de scrapers disponibles.",
        children=[
            DocSection(
                id="amazon",
                title="Amazon",
                description="Scrapers para Amazon.",
                children=[
                    DocExample("amazon-product-details", "Detalles de producto", "GET", "/?scraper=amazon-product-details", "Obtiene datos estructurados de un producto."),
                    DocExample("amazon-serp", "Amazon SERP", "GET", "/?scraper=amazon-serp", "Resultados de búsqueda en Amazon."),
                    DocExample("amazon-offer-listing", "Listado de ofertas", "GET", "/?scraper=amazon-offer-listing", "Listados de ofertas de un producto."),
                    DocExample("amazon-product-reviews", "Reseñas de producto", "GET", "/?scraper=amazon-product-reviews", "Recupera reseñas de producto."),
                    DocExample("amazon-best-sellers", "Los más vendidos", "GET", "/?scraper=amazon-best-sellers", "Ranking de best sellers."),
                    DocExample("amazon-new-releases", "Nuevos lanzamientos", "GET", "/?scraper=amazon-new-releases", "Novedades de Amazon."),
                ],
            ),
            DocSection(
                id="google",
                title="Google",
                description="Scrapers para Google.",
                children=[
                    DocExample("google-serp", "Google SERP", "GET", "/?scraper=google-serp", "Resultados de búsqueda de Google."),
                    DocExample("google-product-offers", "Ofertas de producto", "GET", "/?scraper=google-product-offers", "Ofertas de Google Shopping."),
                ],
            ),
            DocSection(
                id="facebook",
                title="Facebook",
                description="Scrapers para Facebook.",
                children=[
                    DocExample("facebook-group", "Grupo de Facebook", "GET", "/?scraper=facebook-group", "Datos de grupos públicos."),
                    DocExample("facebook-page", "Página de Facebook", "GET", "/?scraper=facebook-page", "Información estructurada de páginas."),
                    DocExample("facebook-profile", "Perfil de Facebook", "GET", "/?scraper=facebook-profile", "Detalle de perfiles públicos."),
                    DocExample("facebook-hashtag", "Hashtag de Facebook", "GET", "/?scraper=facebook-hashtag", "Búsqueda por hashtag."),
                    DocExample("facebook-event", "Evento de Facebook", "GET", "/?scraper=facebook-event", "Detalles de eventos."),
                ],
            ),
            DocSection(
                id="instagram",
                title="Instagram",
                description="Scrapers para Instagram.",
                children=[
                    DocExample("instagram-reel", "Reel de Instagram", "GET", "/?scraper=instagram-reel", "Datos estructurados de un reel."),
                    DocExample("instagram-post", "Publicación de Instagram", "GET", "/?scraper=instagram-post", "Detalle de publicaciones."),
                    DocExample("instagram-profile", "Perfil de Instagram", "GET", "/?scraper=instagram-profile", "Información de perfil."),
                    DocExample("instagram-hashtag", "Hashtag de Instagram", "GET", "/?scraper=instagram-hashtag", "Resultados por hashtag."),
                    DocExample("instagram-reels-audio", "Audio de reels", "GET", "/?scraper=instagram-reels-audio", "Información de audio."),
                ],
            ),
            DocSection(
                id="tiktok",
                title="TikTok",
                description="Scrapers para TikTok.",
                children=[
                    DocExample("tiktok-product", "Producto de TikTok", "GET", "/?scraper=tiktok-product", "Detalle de producto."),
                    DocExample("tiktok-shop", "Tienda de TikTok", "GET", "/?scraper=tiktok-shop", "Información de tienda."),
                    DocExample("tiktok-profile", "Perfil de TikTok", "GET", "/?scraper=tiktok-profile", "Datos de perfil."),
                ],
            ),
            DocSection(
                id="shein",
                title="Shein",
                description="Scrapers para Shein.",
                children=[DocExample("shein-product", "Producto Shein", "GET", "/?scraper=shein-product", "Información de productos Shein.")],
            ),
            DocSection(
                id="linkedin",
                title="LinkedIn",
                description="Scrapers para LinkedIn.",
                children=[
                    DocExample("linkedin-profile", "Perfil de LinkedIn", "GET", "/?scraper=linkedin-profile", "Detalle de perfiles."),
                    DocExample("linkedin-company", "Empresa de LinkedIn", "GET", "/?scraper=linkedin-company", "Información de empresas."),
                    DocExample("linkedin-feed", "Feed de LinkedIn", "GET", "/?scraper=linkedin-feed", "Actividad del feed."),
                ],
            ),
            DocSection(
                id="quora",
                title="Quora",
                description="Scrapers para Quora.",
                children=[
                    DocExample("quora-serp", "Quora SERP", "GET", "/?scraper=quora-serp", "Resultados de búsqueda."),
                    DocExample("quora-question", "Pregunta de Quora", "GET", "/?scraper=quora-question", "Detalle de una pregunta."),
                ],
            ),
            DocSection(
                id="airbnb",
                title="Airbnb",
                description="Scrapers para Airbnb.",
                children=[DocExample("airbnb-serp", "Airbnb SERP", "GET", "/?scraper=airbnb-serp", "Resultados de alojamientos.")],
            ),
            DocSection(
                id="ebay",
                title="eBay",
                description="Scrapers para eBay.",
                children=[
                    DocExample("ebay-serp", "eBay SERP", "GET", "/?scraper=ebay-serp", "Resultados de búsqueda."),
                    DocExample("ebay-product", "Producto eBay", "GET", "/?scraper=ebay-product", "Detalles de producto."),
                    DocExample("ebay-seller-shop", "Tienda de vendedor", "GET", "/?scraper=ebay-seller-shop", "Información de tienda."),
                ],
            ),
            DocSection(
                id="aliexpress",
                title="AliExpress",
                description="Scrapers para AliExpress.",
                children=[
                    DocExample("aliexpress-product", "Producto AliExpress", "GET", "/?scraper=aliexpress-product", "Detalle de producto."),
                    DocExample("aliexpress-serp", "AliExpress SERP", "GET", "/?scraper=aliexpress-serp", "Resultados de búsqueda."),
                ],
            ),
            DocSection(
                id="bing",
                title="Bing",
                description="Scrapers para Bing.",
                children=[DocExample("bing-serp", "Bing SERP", "GET", "/?scraper=bing-serp", "Resultados de búsqueda Bing.")],
            ),
            DocSection(
                id="immobilienscout24",
                title="Immobilienscout24",
                description="Scraper inmobiliario.",
                children=[DocExample("immobilienscout24-property", "Propiedad Immobilienscout24", "GET", "/?scraper=immobilienscout24-property", "Detalles de propiedades.")],
            ),
            DocSection(
                id="walmart",
                title="Walmart",
                description="Scrapers para Walmart.",
                children=[
                    DocExample("walmart-serp", "Walmart SERP", "GET", "/?scraper=walmart-serp", "Resultados de búsqueda."),
                    DocExample("walmart-product-details", "Detalles de producto Walmart", "GET", "/?scraper=walmart-product-details", "Información estructurada."),
                    DocExample("walmart-category", "Categoría Walmart", "GET", "/?scraper=walmart-category", "Exploración de categorías."),
                ],
            ),
            DocSection(
                id="bestbuy",
                title="Best Buy",
                description="Scrapers para Best Buy.",
                children=[
                    DocExample("bestbuy-serp", "Best Buy SERP", "GET", "/?scraper=bestbuy-serp", "Resultados de búsqueda."),
                    DocExample("bestbuy-product-details", "Detalles de producto Best Buy", "GET", "/?scraper=bestbuy-product-details", "Información de producto."),
                ],
            ),
            DocSection(
                id="g2",
                title="G2",
                description="Scrapers para G2.",
                children=[DocExample("g2-product-reviews", "Reseñas de producto G2", "GET", "/?scraper=g2-product-reviews", "Opiniones de productos.")],
            ),
            DocSection(
                id="eventbrite",
                title="Eventbrite",
                description="Scrapers para Eventbrite.",
                children=[
                    DocExample("eventbrite-events-list", "Lista de eventos", "GET", "/?scraper=eventbrite-events-list", "Resultados de eventos."),
                    DocExample("eventbrite-event-details", "Detalles de evento", "GET", "/?scraper=eventbrite-event-details", "Información de un evento."),
                ],
            ),
            DocSection(
                id="generic",
                title="Genérico",
                description="Scrapers genéricos.",
                children=[
                    DocExample("generic-extractor", "Extractor genérico", "GET", "/?scraper=generic-extractor", "Extrae contenido general."),
                    DocExample("email-extractor", "Extractor de correos", "GET", "/?scraper=email-extractor", "Extrae correos electrónicos."),
                ],
            ),
        ],
    ),
    DocSection(
        id="proxy-mode",
        title="Modo proxy",
        description="Configura el modo proxy de la Crawling API.",
        children=[
            DocExample(
                id="proxy-mode-basic",
                title="Activar proxy",
                method="GET",
                path="/?token={token}&url=https://example.org&proxy=us",
                description="Fuerza el uso de un proxy específico.",
            )
        ],
    ),
    DocSection(
        id="try-api",
        title="Prueba la API",
        description="Herramientas rápidas para probar solicitudes desde la aplicación.",
        children=[
            DocExample(
                id="try-api-console",
                title="Consola interactiva",
                method="GET",
                path="/?token={token}&url=https://example.org",
                description="Ejecuta solicitudes desde la consola integrada.",
            )
        ],
    ),
    DocSection(
        id="product-suite",
        title="Suite adicional de productos",
        description="Resto de productos Crawlbase disponibles.",
        children=[
            DocSection(
                id="scraper-api",
                title="Scraper API",
                description="Uso de la Scraper API.",
                children=[],
            ),
            DocSection(
                id="crawler",
                title="Crawler",
                description="Gestión del producto Crawler.",
                children=[],
            ),
            DocSection(
                id="smart-ai-proxy",
                title="Smart AI Proxy",
                description="Uso del proxy inteligente.",
                children=[],
            ),
            DocSection(
                id="cloud-storage",
                title="Cloud Storage",
                description="Almacenamiento en la nube de Crawlbase.",
                children=[],
            ),
            DocSection(
                id="leads-api",
                title="Leads API",
                description="Captura de leads con Crawlbase.",
                children=[],
            ),
            DocSection(
                id="screenshots-api",
                title="Screenshots API",
                description="Captura de pantallas.",
                children=[],
            ),
            DocSection(
                id="proxy-backconnect-api",
                title="Proxy Backconnect API",
                description="Rotación avanzada de proxies.",
                children=[],
            ),
            DocSection(
                id="user-agents-api",
                title="User Agents API",
                description="Selección de user agents.",
                children=[],
            ),
            DocSection(
                id="account-api",
                title="Account API",
                description="Consultas de cuenta.",
                children=[
                    DocExample(
                        id="account-get",
                        title="GET /account",
                        method="GET",
                        path="/account?product=crawling-api",
                        description="Obtiene métricas de consumo de la cuenta.",
                    )
                ],
            ),
            DocSection(
                id="status-codes",
                title="API Status Codes",
                description="Listado de códigos de estado.",
                children=[],
            ),
        ],
    ),
]

