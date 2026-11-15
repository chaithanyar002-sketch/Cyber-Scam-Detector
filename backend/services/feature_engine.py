"""Feature extraction: URL signals and text (social-engineering) signals.

Each extractor returns plain, human-readable facts. The detector turns them into
a rule score and utils/explain.py turns them into reasons.
"""
import re
from urllib.parse import urlparse

URL_RE = re.compile(r"(https?://[^\s]+|www\.[^\s]+)", re.I)
IP_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "ow.ly", "cutt.ly", "rb.gy", "tiny.cc"}
SUSPICIOUS_TLDS = {"xyz", "top", "click", "gq", "tk", "ml", "cf", "work", "zip", "country", "loan"}
URL_KEYWORDS = ["login", "verify", "secure", "account", "update", "bank", "confirm", "signin", "password", "wallet"]

URGENCY = ["urgent", "immediately", "act now", "within 24 hours", "expires", "last chance",
           "final notice", "suspended", "blocked", "asap", "limited time", "right away"]
FINANCIAL = ["bank", "password", "otp", "pin", "card number", "cvv", "account number",
             "credit card", "kyc", "upi", "wire transfer", "refund", "payment"]
SOCIAL_ENGINEERING = ["verify your", "confirm your", "click here", "click the link", "you have won",
                      "congratulations", "claim your", "prize", "dear customer", "do not share",
                      "reply with", "update your details", "login to"]


def _hits(text, phrases):
    t = text.lower()
    return [p for p in phrases if re.search(r"\b" + re.escape(p) + r"\b", t)]


def extract_urls(text):
    return [u.rstrip(".,;:!?)") for u in URL_RE.findall(text)]


def url_features(url):
    parsed = urlparse(url if "://" in url else "http://" + url)
    host = (parsed.hostname or "").lower()
    tld = host.rsplit(".", 1)[-1] if "." in host else ""
    return {
        "url": url,
        "host": host,
        "length": len(url),
        "dots": host.count("."),
        "has_ip": bool(IP_RE.match(host)),
        "https": parsed.scheme == "https",
        "has_at": "@" in url,
        "hyphens": host.count("-"),
        "shortener": host in SHORTENERS or host.replace("www.", "") in SHORTENERS,
        "suspicious_tld": tld in SUSPICIOUS_TLDS,
        "keywords": [k for k in URL_KEYWORDS if k in url.lower()],
    }


def extract_features(text):
    urls = [url_features(u) for u in extract_urls(text)]
    return {
        "urls": urls,
        "urgency": _hits(text, URGENCY),
        "financial": _hits(text, FINANCIAL),
        "social": _hits(text, SOCIAL_ENGINEERING),
        "num_urls": len(urls),
    }
