"""Central settings. Everything can be overridden with environment variables."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")
FEEDBACK_PATH = os.path.join(BASE_DIR, "data", "feedback.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "vectorizer.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "models", "metrics.json")
DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "data", "logs.db"))

# Fusion weights: final = ML_WEIGHT * ml_probability + RULE_WEIGHT * rule_score
ML_WEIGHT = float(os.environ.get("ML_WEIGHT", 0.7))
RULE_WEIGHT = float(os.environ.get("RULE_WEIGHT", 0.3))

# Risk thresholds on the 0-100 score
MEDIUM_THRESHOLD = int(os.environ.get("MEDIUM_THRESHOLD", 35))
HIGH_THRESHOLD = int(os.environ.get("HIGH_THRESHOLD", 65))

MAX_INPUT_CHARS = 5000
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

# If set, POST /train requires header X-Admin-Token. Set this on any public deployment.
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
