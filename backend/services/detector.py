"""Hybrid detection engine: rule score + ML probability fused into one risk score."""
import config
from services import feature_engine
from utils import explain


def rule_score(f):
    """0.0-1.0 score from URL and text signals."""
    s = 0.0
    s += min(0.15 * len(f["urgency"]), 0.30)
    s += min(0.10 * len(f["financial"]), 0.25)
    s += min(0.08 * len(f["social"]), 0.16)
    for u in f["urls"]:
        s += 0.10  # any link is a mild signal
        s += 0.20 if u["shortener"] else 0
        s += 0.25 if u["has_ip"] else 0
        s += 0.10 if u["has_at"] else 0
        s += 0.08 if not u["https"] else 0
        s += 0.10 if u["suspicious_tld"] else 0
        s += 0.08 if (u["dots"] >= 3 or u["hyphens"] >= 2) else 0
        s += 0.05 if u["length"] > 60 else 0
        s += 0.05 if u["keywords"] else 0
    return min(s, 1.0)


def level_for(score):
    if score >= config.HIGH_THRESHOLD:
        return "HIGH"
    return "MEDIUM" if score >= config.MEDIUM_THRESHOLD else "LOW"


LABELS = {"LOW": "SAFE", "MEDIUM": "SUSPICIOUS", "HIGH": "PHISHING"}


def analyze(text, model):
    feats = feature_engine.extract_features(text)
    r = rule_score(feats)
    p = model.scam_probability(text)
    score = round(100 * (config.ML_WEIGHT * p + config.RULE_WEIGHT * r))
    level = level_for(score)

    reasons = explain.rule_reasons(feats)
    ml_note = explain.ml_reason(p)
    if ml_note:
        reasons.append(ml_note)
    if not reasons:
        reasons = ["No suspicious patterns detected"]

    return {
        "label": LABELS[level],
        "level": level,
        "risk_score": score,
        "score": score,  # kept for older clients
        "ml_score": round(p, 3),
        "rule_score": round(r, 3),
        "reasons": reasons,
    }


def explain_detail(text, model):
    """Full breakdown for the /explain endpoint."""
    result = analyze(text, model)
    feats = feature_engine.extract_features(text)
    result["top_terms"] = model.top_terms(text)
    result["features"] = feats
    result["weights"] = {"ml": config.ML_WEIGHT, "rules": config.RULE_WEIGHT}
    return result
