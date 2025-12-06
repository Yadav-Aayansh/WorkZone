# export_openapi_yaml.py
from pathlib import Path
import yaml
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

# import your FastAPI app (adjust import to your project)
from src.main import app
app: FastAPI  # replace with actual import or reference

def export_openapi_yaml(app: FastAPI, filename: str = "openapi.yaml"):
    schema = get_openapi(
        title=app.title or "FastAPI",
        version=app.version or "0.0.0",
        routes=app.routes,
    )
    Path(filename).write_text(yaml.safe_dump(schema, sort_keys=False, allow_unicode=True))
    print(f"OpenAPI YAML written to {filename}")

if __name__ == "__main__":
    # If your app is in a module, import it here, e.g.:
    # from myservice.main import app
    export_openapi_yaml(app, "openapi.yaml")
