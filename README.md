# Churn Predictor (MLOps Project)

An end-to-end machine learning system for predicting customer churn, built to simulate a production-style MLOps workflow.

This project combines:

* machine learning pipelines
* experiment tracking
* model serving APIs
* containerized deployment
* CI/CD automation
* interactive business-facing demo UI

---

# Live Demo

### Web App

https://churn-predictor-65f9.onrender.com

### API Docs (Swagger)

https://churn-predictor-65f9.onrender.com/docs

> Note: Hosted on Render free tier. First request after inactivity may take 30–60 seconds (cold start).

---

# Project Goal

The purpose of this project was to build a realistic portfolio-ready MLOps system that goes beyond simple model training.

It demonstrates how a churn model can be:

* trained
* versioned
* evaluated
* deployed
* monitored
* used through a real interface

---

# Key Features

## Machine Learning

* Synthetic telecom churn dataset generation
* Feature engineering pipeline
* Logistic Regression baseline model
* Scikit-learn Pipeline + ColumnTransformer
* Evaluation with multiple metrics:

  * Accuracy
  * Precision
  * Recall
  * F1-score
  * ROC-AUC

---

## MLOps Engineering

* MLflow experiment tracking
* Artifact management
* Docker containerization
* CI/CD with GitHub Actions
* Health monitoring endpoints
* Structured API logging
* Retraining scripts
* Batch prediction pipeline
* Drift detection checks

---

## Product / UI Layer

A custom web interface was built on top of FastAPI for easier demos and business usage.

Users can:

* Generate sample customer datasets
* Predict churn in batch
* Filter results by risk level
* Search prediction results
* Export filtered data to CSV
* Edit customer rows for what-if analysis
* Navigate large datasets with pagination

---

# Demo UI Preview

*Add screenshots here later*

Recommended screenshots:

1. Main dashboard
2. Prediction results
3. Search + filter
4. Editable rows / scenario testing

---

# Tech Stack

## Backend

* Python 3.11
* FastAPI
* Uvicorn

## Machine Learning

* scikit-learn
* pandas
* numpy

## MLOps

* MLflow
* Docker
* GitHub Actions

## Frontend

* HTML
* CSS
* JavaScript

## Deployment

* Render

---

# Project Structure

```bash
churn-predictor/
│
├── .github/
│   └── workflows
│     └── ci.yml
├── artifacts/
│   ├── metrics/
│   | └── train_metrics.json
│   └── models/
│     └── churn_model.joblib
├── configs/
│   ├── api_config.yaml
│   ├── config.yaml
│   └── model_config.yaml
├── data/
│   ├── processed/
│   | └── batch_input.csv
│   └── raw/
│     └── customer_churn.csv
├── scripts/
│   ├── batch_predict.py
│   ├── check_drift.py
│   ├── generate_data.py
│   ├── retrain.py
│   └── train.py
├── src/
│   ├── api/
│   | ├── routes/
│   | | ├── health.py
│   | | ├── metrics.py
│   | | ├── predict_batch.py
│   | | ├── predict.py
│   | | ├── sample.py
│   | | └── ui.py
│   | ├── dependencies.py
│   | ├── main.py
│   | └── schemas.py
│   ├── data/
│   | ├── load_data.py
│   | └── preprocess.py
│   ├── features/
│   | └── build_features.py
│   ├── models/
│   | ├── evaluate.py
│   | └── train_model.py
│   ├── monitoring/
│   | ├── drift.py
│   | └── logger.py
│   └── pipelines/
│     └── training_pipeline.py
├── static/
│   ├── css/
│   | └── styles.css
│   └── js/
│     └── app.js
├── templates/
│   └── index.html
├── tests/
│   ├── test_api.py
│   └── test_features.py
├── .dockerignore
├── .gitignore
├── .python-version
├── Dockerfile
├── pyproject.toml
├── README.md
├── requirements.txt
└── uv.lock
```

---

# Run Locally

## Install dependencies

```bash
uv sync
```

---

## Generate dataset

```bash
uv run python -m scripts.generate_data
```

---

## Train model

```bash
uv run python -m scripts.train
```

---

## Start API

```bash
uv run uvicorn src.api.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

---

# Run with Docker

```bash
docker build -t churn-predictor .
docker run -p 8000:8000 churn-predictor
```

---

# Batch Inference

Run predictions on generated datasets:

```bash
uv run python -m scripts.batch_predict
```

---

# Drift Detection

Compare new incoming data to training reference data:

```bash
uv run python -m scripts.check_drift
```

Detects:

* mean/std drift
* categorical distribution shifts
* warning reports in JSON

---

# CI/CD

GitHub Actions automatically runs on push / pull request:

* Ruff linting
* Pytest test suite
* dependency install checks

---

# Deployment

The project is deployed as a live Dockerized FastAPI application on Render.

Features:

* auto deploy from GitHub
* health checks
* public API access
* production-style hosting workflow

---

# Why This Project Matters

Many ML projects stop after model training.

This project demonstrates the full lifecycle:

```text
Data → Features → Model → API → Docker → CI/CD → Cloud → UI
```

That is the difference between a notebook project and an MLOps project.

---

# Future Improvements

* Model registry promotion flow
* A/B model serving
* Authentication
* Real customer dataset integration
* Monitoring dashboard
* Kubernetes deployment

---

# Author

Built by Jonas Johansson as a portfolio project focused on MLOps Engineering.
