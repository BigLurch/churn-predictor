# Data loading utilities.

# This module provides functions for loading raw datasets from disk into pandas DataFrames.
# It includes basic validation such as file existence and empty dataset checks.

from pathlib import Path
import pandas as pd


def load_csv_data(path: str | Path) -> pd.DataFrame:
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {path}")

    df = pd.read_csv(path)

    if df.empty:
        raise ValueError(f"Loaded dataframe is empty: {path}")

    return df