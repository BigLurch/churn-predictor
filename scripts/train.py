# Training entry point.

# This script runs the full training pipeline and outputs the trained model,
# evaluation metrics, and experiment tracking information.

from src.pipelines.training_pipeline import run_training_pipeline


if __name__ == "__main__":
    result = run_training_pipeline()
    print("Training completed.")
    print(result)