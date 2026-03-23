# Prediction endpoint.

# Handles incoming requests and returns churn predictions.

from fastapi import APIRouter
import pandas as pd

from src.api.schemas import PredictionRequest, PredictionResponse
from src.api.dependencies import model
from src.features.build_features import build_features

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    data = pd.DataFrame([request.model_dump()])
    data = build_features(data)

    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0][1]

    return PredictionResponse(
        prediction=int(prediction),
        probability=float(probability),
    )