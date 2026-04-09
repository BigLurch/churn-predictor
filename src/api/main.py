# Main FastAPI application.

# Initializes the API and registers routes.

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.api.routes.predict import router as predict_router
from src.api.routes.predict_batch import router as predict_batch_router
from src.api.routes.sample import router as sample_router
from src.api.routes.health import router as health_router
from src.api.routes.metrics import router as metrics_router
from src.api.routes.ui import router as ui_router

app = FastAPI(title="Churn Prediction API")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(ui_router)
app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(sample_router)
app.include_router(predict_router)
app.include_router(predict_batch_router)