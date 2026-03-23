# Feature engineering logic.

# This module contains functions for creating additional features from raw input data.
# Feature transformations are designed to be reusable across both training and inference.

import pandas as pd


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if "TotalCharges" in df.columns and "MonthlyCharges" in df.columns:
        df["tenure_ratio"] = df["TotalCharges"] / df["MonthlyCharges"].replace(0, 1)

    if "tenure" in df.columns and "MonthlyCharges" in df.columns:
        df["monthly_tenure_interaction"] = df["tenure"] * df["MonthlyCharges"]

    return df