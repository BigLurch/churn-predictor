# Generate a synthetic customer churn dataset.

# This script creates a realistic tabular dataset with both numerical and categorical features,
# including a target variable (Churn). The data includes simple behavioral patterns so that
# machine learning models can learn meaningful relationships.

# The generated dataset is saved to the raw data directory.


import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

N = 2000

def generate_data(n: int) -> pd.DataFrame:
    data = {
        "tenure": np.random.randint(1, 72, n),
        "MonthlyCharges": np.random.uniform(20, 120, n).round(2),
        "TotalCharges": None,
        "Contract": np.random.choice(["Month-to-month", "One year", "Two year"], n),
        "PaymentMethod": np.random.choice(
            ["Electronic check", "Mailed check", "Bank transfer", "Credit card"], n
        ),
        "InternetService": np.random.choice(
            ["DSL", "Fiber optic", "No"], n
        ),
        "OnlineSecurity": np.random.choice(["Yes", "No"], n),
    }

    df = pd.DataFrame(data)

    df["TotalCharges"] = (df["tenure"] * df["MonthlyCharges"]).round(2)

    churn_prob = (
        0.3
        + 0.3 * (df["Contract"] == "Month-to-month").astype(int)
        + 0.2 * (df["PaymentMethod"] == "Electronic check").astype(int)
        + 0.2 * (df["tenure"] < 12).astype(int)
    )

    churn_prob = np.clip(churn_prob, 0, 0.9)

    df["Churn"] = np.where(
        np.random.rand(n) < churn_prob,
        "Yes",
        "No"
    )

    return df


def main():
    df = generate_data(N)

    output_path = Path("data/raw/customer_churn.csv")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(output_path, index=False)

    print(f"Dataset saved to: {output_path}")
    print(df.head())


if __name__ == "__main__":
    main()