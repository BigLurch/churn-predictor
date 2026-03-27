# Dependencies for API.

# Handles loading and providing shared resources like the trained model.

import joblib
from pathlib import Path

MODEL_PATH = Path("artifacts/models/churn_model.joblib")

_model = None


def load_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

        _model = joblib.load(MODEL_PATH)

    return _model