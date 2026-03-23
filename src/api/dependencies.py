# Dependencies for API.

# Handles loading and providing shared resources like the trained model.

import joblib
from pathlib import Path

MODEL_PATH = Path("artifacts/models/churn_model.joblib")


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    model = joblib.load(MODEL_PATH)
    return model


# Singleton-style loading
model = load_model()