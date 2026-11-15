"""Loads the trained TF-IDF + Logistic Regression model and scores text.

Training lives in train_model.py; this module only loads artifacts (and can
trigger a retrain, used by the /train endpoint).
"""
import json
import os

import joblib
import numpy as np

import config


class MLModel:
    def __init__(self):
        self.vectorizer = None
        self.clf = None
        self.metrics = {}
        self.load()

    def load(self):
        if not (os.path.exists(config.MODEL_PATH) and os.path.exists(config.VECTORIZER_PATH)):
            from train_model import train
            train()
        self.vectorizer = joblib.load(config.VECTORIZER_PATH)
        self.clf = joblib.load(config.MODEL_PATH)
        if os.path.exists(config.METRICS_PATH):
            with open(config.METRICS_PATH) as fh:
                self.metrics = json.load(fh)

    def retrain(self):
        from train_model import train
        result = train()
        self.load()
        return result

    def scam_probability(self, text):
        x = self.vectorizer.transform([text])
        classes = list(self.clf.classes_)
        return float(self.clf.predict_proba(x)[0][classes.index("spam")])

    def top_terms(self, text, n=5):
        """Words in the message pushing the score towards scam (coef * tf-idf)."""
        x = self.vectorizer.transform([text])
        if x.nnz == 0:
            return []
        classes = list(self.clf.classes_)
        sign = 1 if classes.index("spam") == 1 else -1
        contrib = x.multiply(self.clf.coef_[0] * sign).tocoo()
        names = self.vectorizer.get_feature_names_out()
        pairs = sorted(zip(contrib.col, contrib.data), key=lambda p: -abs(p[1]))[:n]
        return [{"term": names[c], "weight": round(float(v), 3)} for c, v in pairs if abs(v) > 1e-3]
