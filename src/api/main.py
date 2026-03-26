# Main FastAPI application.

# Initializes the API and registers routes.

from fastapi import FastAPI

from src.api.routes.predict import router as predict_router
from src.api.routes.health import router as health_router
from src.api.routes.metrics import router as metrics_router

app = FastAPI(title="Churn Prediction API")

app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(predict_router)