# Batch prediction script.

# Runs predictions on a dataset and saves results to disk.

import pandas as pd
from pathlib import Path
import joblib
from datetime import datetime

from src.features.build_features import build_features

timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
date_folder = datetime.now().strftime("%Y-%m-%d")

MODEL_PATH = Path("artifacts/models/churn_model.joblib")
INPUT_PATH = Path("data/processed/batch_input.csv")
OUTPUT_PATH = Path(f"artifacts/predictions/{date_folder}/batch_predictions_{timestamp}.csv")


def run_batch_prediction():
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model not found. Train the model first.")

    if not INPUT_PATH.exists():
        raise FileNotFoundError("Input data not found.")

    model = joblib.load(MODEL_PATH)

    df = pd.read_csv(INPUT_PATH)

    df_features = build_features(df)

    predictions = model.predict(df_features)
    probabilities = model.predict_proba(df_features)[:, 1]

    df["prediction"] = predictions
    df["probability"] = probabilities
    df["label"] = df["prediction"].map({1: "churn", 0: "no_churn"})

    df["risk_level"] = pd.cut(
        df["probability"],
        bins=[0, 0.3, 0.7, 1],
        labels=["low", "medium", "high"]
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    print(f"Batch predictions saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    run_batch_prediction()