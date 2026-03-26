# Metrics endpoint.

# Provides simple service-level metrics for monitoring.

from fastapi import APIRouter

router = APIRouter()

service_metrics = {
    "prediction_requests_total": 0,
    "health_checks_total": 0,
}


@router.get("/metrics")
def get_metrics():
    return service_metrics