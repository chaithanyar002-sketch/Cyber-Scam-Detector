"""Train the TF-IDF + Logistic Regression model and save artifacts.

    python train_model.py

Writes models/model.pkl, models/vectorizer.pkl and models/metrics.json.
Dataset format: columns v1 (ham/spam) and v2 (text), plus optional user
feedback rows from data/feedback.csv (columns: text,label).
"""
import json
import os
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline

import config


def load_feedback():
    if os.path.exists(config.FEEDBACK_PATH) and os.path.getsize(config.FEEDBACK_PATH) > 0:
        return pd.read_csv(config.FEEDBACK_PATH)
    return pd.DataFrame(columns=["text", "label"])


def load_data():
    df = pd.read_csv(config.DATASET_PATH, encoding="latin-1")[["v1", "v2"]]
    df.columns = ["label", "text"]
    fb = load_feedback()
    data = pd.concat([df, fb[["label", "text"]]], ignore_index=True).dropna()
    data["text"] = data["text"].astype(str).str.strip()
    return data.drop_duplicates(subset="text").reset_index(drop=True), len(fb)


def new_vectorizer():
    return TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2),
                           sublinear_tf=True, min_df=1)


def new_classifier():
    return LogisticRegression(C=5.0, class_weight="balanced", max_iter=1000)


def train(seed=42):
    data, feedback_size = load_data()
    X, y = data["text"], data["label"]

    # Honest evaluation: hold-out split + stratified cross-validation
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=seed)
    eval_model = make_pipeline(new_vectorizer(), new_classifier()).fit(X_tr, y_tr)
    pred = eval_model.predict(X_te)
    p, r, f1, _ = precision_recall_fscore_support(y_te, pred, pos_label="spam", average="binary")
    tn, fp, fn, tp = confusion_matrix(y_te, pred, labels=["ham", "spam"]).ravel()
    cv = cross_val_score(make_pipeline(new_vectorizer(), new_classifier()), X, y,
                         cv=StratifiedKFold(5, shuffle=True, random_state=seed), scoring="f1_macro")

    # Final model is fitted on all available data
    vec = new_vectorizer()
    clf = new_classifier().fit(vec.fit_transform(X), y)
    os.makedirs(os.path.dirname(config.MODEL_PATH), exist_ok=True)
    joblib.dump(clf, config.MODEL_PATH)
    joblib.dump(vec, config.VECTORIZER_PATH)

    metrics = {
        "algorithm": "TF-IDF (1-2 grams) + Logistic Regression",
        "dataset_size": int(len(data)),
        "feedback_size": int(feedback_size),
        "test_size": int(len(y_te)),
        "accuracy": round(float(accuracy_score(y_te, pred)), 3),
        "precision": round(float(p), 3),
        "recall": round(float(r), 3),
        "f1": round(float(f1), 3),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "cv_f1_macro_mean": round(float(cv.mean()), 3),
        "cv_f1_macro_std": round(float(cv.std()), 3),
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    with open(config.METRICS_PATH, "w") as fh:
        json.dump(metrics, fh, indent=2)
    return metrics


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
