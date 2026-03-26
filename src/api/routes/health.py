# Health check endpoint.

# Used to verify that the API is running.

from fastapi import APIRouter
from src.api.routes.metrics import service_metrics

router = APIRouter()


@router.get("/health")
def health():
    service_metrics["health_checks_total"] += 1
    return {"status": "ok"}