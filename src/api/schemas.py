# API schemas.

# Defines request and response models for prediction endpoints.

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    tenure: int
    MonthlyCharges: float
    TotalCharges: float
    Contract: str
    PaymentMethod: str
    InternetService: str
    OnlineSecurity: str


class PredictionResponse(BaseModel):
    prediction: int
    probability: float