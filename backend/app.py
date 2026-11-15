"""Flask API for the phishing detection platform.

Endpoints: POST /predict, POST /explain, GET /health, GET /logs,
plus POST /feedback, POST /train, GET /status for the model admin page.
"""
import hmac
import os
import re

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

import config
from services import detector
from services.ml_model import MLModel
from utils import logger


def create_app():
    app = Flask(__name__)
    CORS(app, origins=config.CORS_ORIGINS)
    logger.init_db()
    model = MLModel()

    def get_text():
        text = ((request.get_json(silent=True) or {}).get("text") or "").strip()
        if not text:
            return None, (jsonify({"error": "text is required"}), 400)
        if len(text) > config.MAX_INPUT_CHARS:
            return None, (jsonify({"error": f"text must be under {config.MAX_INPUT_CHARS} characters"}), 413)
        return text, None

    def client_id():
        cid = request.headers.get("X-Client-Id", "")
        return cid if re.fullmatch(r"[A-Za-z0-9-]{8,64}", cid) else ""

    @app.post("/predict")
    def predict():
        text, err = get_text()
        if err:
            return err
        result = detector.analyze(text, model)
        logger.log_prediction(text, result, client_id())
        return jsonify(result)

    @app.post("/explain")
    def explain():
        text, err = get_text()
        if err:
            return err
        return jsonify(detector.explain_detail(text, model))

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "model_loaded": model.clf is not None,
                        "algorithm": model.metrics.get("algorithm")})

    @app.get("/logs")
    def logs():
        try:
            limit = max(1, min(int(request.args.get("limit", 50)), 500))
        except ValueError:
            limit = 50
        cid = client_id()
        return jsonify({"logs": logger.get_logs(limit, cid), "summary": logger.stats(cid)})

    @app.post("/feedback")
    def feedback():
        d = request.get_json(silent=True) or {}
        if not d.get("text") or d.get("level") not in ("LOW", "MEDIUM", "HIGH"):
            return jsonify({"error": "text and level (LOW/MEDIUM/HIGH) required"}), 400
        predicted_spam = d["level"] != "LOW"
        is_spam = predicted_spam if d.get("correct") else not predicted_spam
        fresh = not os.path.exists(config.FEEDBACK_PATH) or os.path.getsize(config.FEEDBACK_PATH) == 0
        pd.DataFrame([{"text": d["text"], "label": "spam" if is_spam else "ham"}]).to_csv(
            config.FEEDBACK_PATH, mode="a", header=fresh, index=False)
        return jsonify({"status": "saved"})

    @app.get("/status")
    def status():
        return jsonify({"status": "ready", "weights": {"ml": config.ML_WEIGHT, "rules": config.RULE_WEIGHT},
                        **model.metrics})

    @app.post("/train")
    def train():
        if config.ADMIN_TOKEN and not hmac.compare_digest(request.headers.get("X-Admin-Token", ""), config.ADMIN_TOKEN):
            return jsonify({"error": "admin token required to retrain"}), 401
        return jsonify({"status": "retrained", **model.retrain()})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)), debug=os.environ.get("FLASK_DEBUG") == "1")
