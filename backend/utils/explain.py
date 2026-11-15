"""Turns extracted features + model output into readable reasons."""


def rule_reasons(f):
    reasons = []
    if f["urgency"]:
        reasons.append(f"Urgency-based language detected: {', '.join(f['urgency'][:4])}")
    if f["financial"]:
        reasons.append(f"Asks about or mentions sensitive financial data: {', '.join(f['financial'][:4])}")
    if f["social"]:
        reasons.append(f"Social-engineering phrasing: {', '.join(f['social'][:3])}")
    for u in f["urls"]:
        name = u["host"] or u["url"][:40]
        if u["shortener"]:
            reasons.append(f"Contains URL shortening service ({name}) that hides the real destination")
        if u["has_ip"]:
            reasons.append(f"URL uses a raw IP address instead of a domain ({name})")
        if u["has_at"]:
            reasons.append("URL contains '@', a trick used to disguise the real host")
        if not u["https"] and not u["shortener"]:
            reasons.append(f"Link is not HTTPS ({name})")
        if u["suspicious_tld"]:
            reasons.append(f"Domain uses a TLD often abused in scams ({name})")
        if u["dots"] >= 3 or u["hyphens"] >= 2:
            reasons.append(f"Domain has many subdomains or hyphens, common in look-alike domains ({name})")
        if u["length"] > 60:
            reasons.append("URL is unusually long")
        if u["keywords"]:
            reasons.append(f"URL contains bait words: {', '.join(u['keywords'][:3])}")
    return reasons


def ml_reason(prob):
    if prob >= 0.85:
        return f"Model confidence is high ({prob:.0%} scam-like)"
    if prob >= 0.5:
        return f"Model classifies the wording as scam-like ({prob:.0%})"
    return None
