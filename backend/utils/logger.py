"""SQLite audit log: every prediction is stored with score, label and timestamp."""
import sqlite3
from datetime import datetime, timezone

import config


def _conn():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_text TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            label TEXT NOT NULL,
            ml_score REAL,
            rule_score REAL,
            time TEXT NOT NULL,
            client_id TEXT NOT NULL DEFAULT '')""")
        # migrate databases created before per-device history existed
        cols = [r["name"] for r in c.execute("PRAGMA table_info(logs)")]
        if "client_id" not in cols:
            c.execute("ALTER TABLE logs ADD COLUMN client_id TEXT NOT NULL DEFAULT ''")


def log_prediction(text, result, client_id=""):
    with _conn() as c:
        c.execute("INSERT INTO logs (input_text, risk_score, label, ml_score, rule_score, time, client_id) VALUES (?,?,?,?,?,?,?)",
                  (text, result["risk_score"], result["label"], result["ml_score"], result["rule_score"],
                   datetime.now(timezone.utc).isoformat(timespec="seconds"), client_id))


def get_logs(limit=50, client_id=""):
    """Only the caller's own rows: the deployed app is public, so history is per device."""
    with _conn() as c:
        rows = c.execute("SELECT id, input_text, risk_score, label, ml_score, rule_score, time FROM logs "
                         "WHERE client_id = ? ORDER BY id DESC LIMIT ?", (client_id, limit)).fetchall()
    return [dict(r) for r in rows]


def stats(client_id=""):
    with _conn() as c:
        rows = c.execute("SELECT label, COUNT(*) n FROM logs WHERE client_id = ? GROUP BY label", (client_id,)).fetchall()
    return {r["label"]: r["n"] for r in rows}
