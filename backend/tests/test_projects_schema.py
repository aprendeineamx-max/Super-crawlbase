from app.projects.schemas import ProjectCreateSchema


def test_project_create_schema_defaults() -> None:
    schema = ProjectCreateSchema(
        name="Amazon BF Deals",
        profile_id=1,
        scraper_key="amazon-serp",
    )

    assert schema.status == "draft"
    assert schema.output_formats == ["xlsx"]
    assert schema.link_blueprint == {}

