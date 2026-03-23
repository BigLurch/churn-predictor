# Churn Predictor (MLOps Project)

This project demonstrates an end-to-end machine learning pipeline for predicting customer churn, designed to mimic a production-ready MLOps system.

## Project Overview

The goal of this project is to build a complete and reproducible ML workflow, covering:

- Data generation and ingestion
- Feature engineering
- Preprocessing and model training
- Model evaluation
- Experiment tracking
- Artifact management

The system is structured to reflect real-world MLOps practices rather than just a simple ML script.

---

## 🧠 What Has Been Implemented

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

This allows comparison between experiments and enables model versioning.

---

### 6. Artifact Management

After training:

- Model is saved to:
    artifacts/models/

- Metrics are saved to:
    artifacts/metrics/


This ensures traceability and reproducibility.

---

### 7. Reproducible Environment

The project uses:

- `uv` for dependency management
- `pyproject.toml` + `uv.lock` for reproducibility
- Python 3.11 (stable ML ecosystem)

---

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


---

## How to Run

### 1. Generate dataset

```bash
uv run python -m scripts.generate_data
```

### 2. Train model

```bash
uv run python -m scripts.train
```