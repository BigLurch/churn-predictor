# End-to-end training pipeline.

# This module orchestrates the full machine learning workflow:
# data loading, feature engineering, preprocessing, model training,
# evaluation, and artifact logging using MLflow.

# It ensures reproducibility and consistent model outputs.

from pathlib import Path
import json

import joblib
import mlflow
import mlflow.sklearn

from sklearn.model_selection import train_test_split

from src.data.load_data import load_csv_data
from src.data.preprocess import create_preprocessor
from src.features.build_features import build_features
from src.models.train_model import create_model_pipeline
from src.models.evaluate import evaluate_classification_model


DATA_PATH = "data/raw/customer_churn.csv"
MODEL_OUTPUT_PATH = "artifacts/models/churn_model.joblib"
METRICS_OUTPUT_PATH = "artifacts/metrics/train_metrics.json"
TARGET_COLUMN = "Churn"


def run_training_pipeline(
    data_path: str = DATA_PATH,
    model_output_path: str = MODEL_OUTPUT_PATH,
    metrics_output_path: str = METRICS_OUTPUT_PATH,
):
    df = load_csv_data(data_path)
    df = build_features(df)

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataset.")

    df = df.copy()

    if df[TARGET_COLUMN].dtype == "object":
        df[TARGET_COLUMN] = df[TARGET_COLUMN].map({"Yes": 1, "No": 0})

    df = df.dropna(subset=[TARGET_COLUMN])

    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN].astype(int)

    preprocessor = create_preprocessor(X)
    model_pipeline = create_model_pipeline(preprocessor)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    mlflow.set_experiment("churn-predictor-training")

    with mlflow.start_run():
        model_pipeline.fit(X_train, y_train)

        y_pred = model_pipeline.predict(X_test)
        y_proba = model_pipeline.predict_proba(X_test)[:, 1]

        metrics = evaluate_classification_model(y_test, y_pred, y_proba)

        mlflow.log_param("model_type", "LogisticRegression")
        mlflow.log_param("test_size", 0.2)
        mlflow.log_param("random_state", 42)

        for metric_name, metric_value in metrics.items():
            mlflow.log_metric(metric_name, metric_value)

        Path(model_output_path).parent.mkdir(parents=True, exist_ok=True)
        Path(metrics_output_path).parent.mkdir(parents=True, exist_ok=True)

        joblib.dump(model_pipeline, model_output_path)

        with open(metrics_output_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        mlflow.sklearn.log_model(model_pipeline, name="model")

    return {
        "model": model_pipeline,
        "model_path": model_output_path,
        "metrics_path": metrics_output_path,
        "metrics": metrics,
    }