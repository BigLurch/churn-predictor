# Retraining script.

# Retrains the model using updated data and stores a new version
# of the model and metrics with timestamps.

from pathlib import Path
from datetime import datetime
import json

from src.pipelines.training_pipeline import run_training_pipeline


DATA_PATH = Path("data/raw/customer_churn.csv")
MODEL_DIR = Path("artifacts/models/")
METRICS_DIR = Path("artifacts/metrics/")


def run_retraining():
    if not DATA_PATH.exists():
        raise FileNotFoundError("Training data not found.")

    print("Starting retraining...")

    result = run_training_pipeline()
    model = result["model"]
    metrics = result["metrics"]

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")

    model_path = MODEL_DIR / f"churn_model_{timestamp}.joblib"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    import joblib

    # 1. Save the new model
    model_path = MODEL_DIR / f"churn_model_{timestamp}.joblib"
    joblib.dump(model, model_path)

    # 2. Update the latest model
    latest_model_path = MODEL_DIR / "churn_model.joblib"
    joblib.dump(model, latest_model_path)

    METRICS_DIR.mkdir(parents=True, exist_ok=True)
    metrics_path = METRICS_DIR / f"metrics_{timestamp}.json"

    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"New model saved to: {model_path}")
    print(f"Latest model updated: {latest_model_path}")
    print(f"Metrics saved to: {metrics_path}")


if __name__ == "__main__":
    run_retraining()