# Prediction endpoint.

# Handles incoming requests and returns churn predictions.

from fastapi import APIRouter, HTTPException
import pandas as pd

from src.api.schemas import PredictionRequest, PredictionResponse
from src.api.dependencies import model
from src.features.build_features import build_features
from src.monitoring.logger import get_logger
from src.api.routes.metrics import service_metrics

router = APIRouter()
logger = get_logger("churn_api.predict")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        logger.info(f"Received prediction request: {request.model_dump()}")

        data = pd.DataFrame([request.model_dump()])
        data = build_features(data)

        prediction = model.predict(data)[0]
        probability = model.predict_proba(data)[0][1]

        service_metrics["prediction_requests_total"] += 1

        logger.info(
            f"Prediction generated: prediction={int(prediction)}, probability={float(probability):.4f}"
        )

        return PredictionResponse(
            prediction=int(prediction),
            probability=float(probability),
        )

    except Exception as e:
        logger.exception(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed.")