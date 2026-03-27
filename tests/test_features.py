import pandas as pd

from src.features.build_features import build_features


def test_build_features_adds_expected_columns():
    df = pd.DataFrame(
        {
            "tenure": [10, 20],
            "MonthlyCharges": [50.0, 100.0],
            "TotalCharges": [500.0, 2000.0],
        }
    )

    result = build_features(df)

    assert "tenure_ratio" in result.columns
    assert "monthly_tenure_interaction" in result.columns