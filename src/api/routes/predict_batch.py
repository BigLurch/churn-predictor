# Batch prediction endpoint.

# Accepts a list of customers and returns churn predictions for each row.

from fastapi import APIRouter, HTTPException
import pandas as pd

from src.api.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    BatchPredictionItem,
)
from src.api.dependencies import load_model
from src.features.build_features import build_features
from src.monitoring.logger import get_logger
from src.api.routes.metrics import service_metrics

router = APIRouter()
logger = get_logger("churn_api.predict_batch")


@router.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_batch(request: BatchPredictionRequest):
    try:
        logger.info(f"Received batch prediction request with {len(request.customers)} customers")

        rows = [customer.model_dump() for customer in request.customers]
        data = pd.DataFrame(rows)
        data = build_features(data)

        model = load_model()
        predictions = model.predict(data)
        probabilities = model.predict_proba(data)[:, 1]

        service_metrics["prediction_requests_total"] += len(rows)

        results = []
        for row, prediction, probability in zip(rows, predictions, probabilities):
            if probability < 0.3:
                risk_level = "low"
            elif probability < 0.7:
                risk_level = "medium"
            else:
                risk_level = "high"

            results.append(
                BatchPredictionItem(
                    **row,
                    prediction=int(prediction),
                    probability=float(probability),
                    label="churn" if int(prediction) == 1 else "no_churn",
                    risk_level=risk_level,
                )
            )

        logger.info(f"Batch prediction completed for {len(results)} customers")

        return BatchPredictionResponse(results=results)

    except Exception as e:
        logger.exception(f"Batch prediction failed: {e}")
        raise HTTPException(status_code=500, detail="Batch prediction failed.")