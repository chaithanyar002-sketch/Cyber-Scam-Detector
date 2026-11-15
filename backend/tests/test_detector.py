import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

import config


@pytest.fixture(scope="module")
def client(tmp_path_factory):
    config.DB_PATH = str(tmp_path_factory.mktemp("db") / "test.db")
    from app import create_app
    return create_app().test_client()


PHISH = "URGENT! Verify your bank password now at http://bit.ly/x9Ka2 or your account is suspended"
SAFE = "Hey, are we still meeting for lunch tomorrow at 1?"


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json["model_loaded"]


def test_predict_phishing(client):
    r = client.post("/predict", json={"text": PHISH})
    assert r.status_code == 200
    assert r.json["label"] == "PHISHING" and r.json["risk_score"] >= 65
    assert any("shortening" in x for x in r.json["reasons"])


def test_predict_safe(client):
    r = client.post("/predict", json={"text": SAFE})
    assert r.json["label"] == "SAFE" and r.json["risk_score"] < 35


def test_score_is_weighted_fusion(client):
    j = client.post("/predict", json={"text": PHISH}).json
    expected = round(100 * (config.ML_WEIGHT * j["ml_score"] + config.RULE_WEIGHT * j["rule_score"]))
    assert abs(j["risk_score"] - expected) <= 1


def test_explain_has_breakdown(client):
    j = client.post("/explain", json={"text": PHISH}).json
    assert j["top_terms"] and j["features"]["urls"][0]["shortener"]


def test_validation(client):
    assert client.post("/predict", json={}).status_code == 400
    assert client.post("/predict", json={"text": "x" * 6000}).status_code == 413


ME = {"X-Client-Id": "device-aaaaaaaa"}
OTHER = {"X-Client-Id": "device-bbbbbbbb"}


def test_logging(client):
    client.post("/predict", json={"text": SAFE}, headers=ME)
    j = client.get("/logs?limit=5", headers=ME).json
    assert j["logs"] and {"input_text", "risk_score", "label", "time"} <= set(j["logs"][0])


def test_history_is_per_device(client):
    client.post("/predict", json={"text": "private message for device A"}, headers=ME)
    assert client.get("/logs", headers=OTHER).json["logs"] == []
    assert client.get("/logs").json["logs"] == []  # no client id -> nothing


def test_train_requires_token_when_configured(client):
    config.ADMIN_TOKEN = "s3cret"
    try:
        assert client.post("/train").status_code == 401
        assert client.post("/train", headers={"X-Admin-Token": "wrong"}).status_code == 401
    finally:
        config.ADMIN_TOKEN = ""
