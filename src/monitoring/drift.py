# Drift detection utilities.

# Compares reference training data with new inference data and generates
# a simple drift report based on numeric and categorical feature changes.

from __future__ import annotations

from pathlib import Path
import json
from datetime import datetime

import pandas as pd


NUMERIC_COLUMNS = ["tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_COLUMNS = ["Contract", "PaymentMethod", "InternetService", "OnlineSecurity"]


def load_dataframe(path: str | Path) -> pd.DataFrame:
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)

    if df.empty:
        raise ValueError(f"File is empty: {path}")

    return df


def summarize_reference_data(df: pd.DataFrame) -> dict:
    summary = {
        "numeric": {},
        "categorical": {},
    }

    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            summary["numeric"][col] = {
                "mean": float(df[col].mean()),
                "std": float(df[col].std()),
            }

    for col in CATEGORICAL_COLUMNS:
        if col in df.columns:
            value_distribution = (
                df[col].value_counts(normalize=True).round(4).to_dict()
            )
            summary["categorical"][col] = {
                "top_value": df[col].mode().iloc[0] if not df[col].mode().empty else None,
                "distribution": value_distribution,
            }

    return summary


def compare_against_reference(reference_summary: dict, current_df: pd.DataFrame) -> dict:
    report = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "drift_detected": False,
        "numeric_checks": {},
        "categorical_checks": {},
    }

    for col in NUMERIC_COLUMNS:
        if col not in current_df.columns or col not in reference_summary["numeric"]:
            continue

        current_mean = float(current_df[col].mean())
        current_std = float(current_df[col].std())

        ref_mean = reference_summary["numeric"][col]["mean"]
        ref_std = reference_summary["numeric"][col]["std"]

        mean_shift = abs(current_mean - ref_mean)
        std_shift = abs(current_std - ref_std)

        mean_drift = mean_shift > (0.2 * abs(ref_mean)) if ref_mean != 0 else mean_shift > 1.0
        std_drift = std_shift > (0.2 * abs(ref_std)) if ref_std not in (0, None) else std_shift > 1.0

        if mean_drift or std_drift:
            report["drift_detected"] = True

        report["numeric_checks"][col] = {
            "reference_mean": ref_mean,
            "current_mean": current_mean,
            "mean_shift": mean_shift,
            "reference_std": ref_std,
            "current_std": current_std,
            "std_shift": std_shift,
            "mean_drift_flag": mean_drift,
            "std_drift_flag": std_drift,
        }

    for col in CATEGORICAL_COLUMNS:
        if col not in current_df.columns or col not in reference_summary["categorical"]:
            continue

        current_distribution = (
            current_df[col].value_counts(normalize=True).round(4).to_dict()
        )
        current_top = current_df[col].mode().iloc[0] if not current_df[col].mode().empty else None
        reference_top = reference_summary["categorical"][col]["top_value"]

        top_value_changed = current_top != reference_top
        if top_value_changed:
            report["drift_detected"] = True

        report["categorical_checks"][col] = {
            "reference_top_value": reference_top,
            "current_top_value": current_top,
            "top_value_changed": top_value_changed,
            "reference_distribution": reference_summary["categorical"][col]["distribution"],
            "current_distribution": current_distribution,
        }

    return report


def save_json(data: dict, path: str | Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)