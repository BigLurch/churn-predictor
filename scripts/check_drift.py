# Drift detection script.

# Creates a reference summary from training data and compares it against
# new batch input data to detect potential data drift.

from pathlib import Path
from datetime import datetime

from src.monitoring.drift import (
    load_dataframe,
    summarize_reference_data,
    compare_against_reference,
    save_json,
)

REFERENCE_DATA_PATH = Path("data/raw/customer_churn.csv")
CURRENT_DATA_PATH = Path("data/processed/batch_input.csv")


def run_drift_check():
    reference_df = load_dataframe(REFERENCE_DATA_PATH)
    current_df = load_dataframe(CURRENT_DATA_PATH)

    if "Churn" in reference_df.columns:
        reference_df = reference_df.drop(columns=["Churn"])

    if "Churn" in current_df.columns:
        current_df = current_df.drop(columns=["Churn"])

    reference_summary = summarize_reference_data(reference_df)
    drift_report = compare_against_reference(reference_summary, current_df)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    output_path = Path(f"artifacts/reports/drift_report_{timestamp}.json")

    save_json(drift_report, output_path)

    print(f"Drift report saved to: {output_path}")
    print(f"Drift detected: {drift_report['drift_detected']}")


if __name__ == "__main__":
    run_drift_check()