# Model definition and training setup.

# This module defines the machine learning model and combines it with preprocessing
# into a single pipeline to ensure consistent training and inference behavior.

from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


def create_model_pipeline(preprocessor):
    model = LogisticRegression(
        max_iter=1000,
        random_state=42
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", model),
        ]
    )

    return pipeline