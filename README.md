# Churn Predictor (MLOps Project)

This project demonstrates an end-to-end machine learning pipeline for predicting customer churn, designed to mimic a production-ready MLOps system.

---

## Project Overview

The goal of this project is to build a complete and reproducible ML workflow, covering:

- Data generation and ingestion
- Feature engineering
- Preprocessing and model training
- Model evaluation
- Experiment tracking
- Model serving via API
- Containerized deployment

The system is structured to reflect real-world MLOps practices rather than just a simple ML script.

---

## What Has Been Implemented

### 1. Synthetic Data Generation
A realistic churn dataset is generated with controlled patterns to simulate customer behavior.

- Numerical features (e.g., tenure, charges)
- Categorical features (e.g., contract type, payment method)
- Target variable: `Churn` (Yes/No)

---

### 2. Modular Data Pipeline

The pipeline is split into clear responsibilities:

- **Data loading** → `src/data/`
- **Feature engineering** → `src/features/`
- **Preprocessing** → `src/data/preprocess.py`
- **Model training** → `src/models/`
- **Pipeline orchestration** → `src/pipelines/`

This structure improves readability, maintainability, and testability.

---

### 3. Machine Learning Pipeline

A full training pipeline has been implemented using:

- `scikit-learn` Pipeline
- `ColumnTransformer` for handling mixed data types
- Logistic Regression as baseline model

This ensures:
- Consistent preprocessing
- No data leakage
- Reproducible training and inference

---

### 4. Model Evaluation

The model is evaluated using multiple metrics:

- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC

This provides a more complete understanding of model performance.

---

### 5. Experiment Tracking (MLflow)

All training runs are logged using MLflow:

- Parameters
- Metrics
- Trained models

This enables experiment comparison and model versioning.

---

### 6. Model Serving (FastAPI)

The trained model is exposed via a REST API using FastAPI.

#### Endpoints:
- `/predict` → returns churn prediction
- `/health` → service status
- `/metrics` → basic monitoring metrics

#### Example request:

```json
{
  "tenure": 12,
  "MonthlyCharges": 70.5,
  "TotalCharges": 846,
  "Contract": "Month-to-month",
  "PaymentMethod": "Electronic check",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No"
}
```

#### Example response:

```json
{
  "prediction": 1,
  "probability": 0.82
}
```

### 7. Observability

The API includes basic observability features:
- Structured logging for requests and predictions
- Error logging with stack traces
- `/health` endpoint
- `/metrics` endpoint for request tracking

### 8. Artifact Management

After training:
- Model → `artifacts/models/`
- Metrics → `artifacts/metrics/`
This ensures traceability and reproducibility.

### 9. Reproducible Environment

The project uses:
- `uv` for dependency management
- `pyproject.toml` + `uv.lock`
- Python 3.11

### 10. Containerization (Docker)

The application is fully containerized using Docker.

This allows:
- consistent runtime environment
- easy deployment
- environment isolation

## Project Structure
```
churn-predictor/
├── src/
├── data/
├── artifacts/
├── configs/
├── scripts/
├── tests/
```

## How to Run

### 1. Generate dataset
```bash
uv run python -m scripts.generate_data
```

### 2. Train model
```bash
uv run python -m scripts.train
```

### 3. Run API
```bash
uv run uvicorn src.api.main:app --reload
```

#### Open:
```
http://127.0.0.1:8000/docs
```

## Run with Docker
```bash
docker build -t churn-predictor .
docker run -p 8000:8000 churn-predictor
```

#### Then open:
```
http://localhost:8000/docs
```

## Outputs
- Trained model → `artifacts/models/`
- Metrics → `artifacts/metrics/`
- MLflow runs → `mlruns/`

## Batch Inference

The project includes a batch prediction pipeline that processes datasets and generates predictions in bulk.

Run:

```bash
uv run python -m scripts.batch_predict
```

## Future Improvements
- Model monitoring (drift detection)
- CI/CD pipeline
- Cloud deployment (AWS / Azure)
- Feature store integration