"""
predict.py — Standalone fraud prediction with risk levels and SHAP explanations.

"""

import os
import logging
from pathlib import Path

import pandas as pd
import xgboost as xgb

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_MODEL_PATH = _PROJECT_ROOT / "xgboost_fraud_model.json"
MODEL_FILE = os.getenv("FRAUD_MODEL_PATH", str(_MODEL_PATH))
FRAUD_THRESHOLD = float(os.getenv("FRAUD_THRESHOLD", "0.80"))

RAW_FEATURES = [
    "amount", "hour_of_day", "is_weekend",
    "receiver_account_age_days", "receiver_report_count",
    "receiver_tx_count_24h", "receiver_unique_senders_24h",
    "previous_connections_count", "avg_transaction_amount_7d",
]

ALL_FEATURES = RAW_FEATURES + ["amount_deviation", "velocity_ratio", "is_first_interaction"]

_model: xgb.XGBClassifier | None = None
_explainer = None


def _load_model() -> xgb.XGBClassifier:
    global _model
    if _model is not None:
        return _model

    if not Path(MODEL_FILE).exists():
        raise FileNotFoundError(f"Model not found: {MODEL_FILE}")

    _model = xgb.XGBClassifier()
    _model.load_model(MODEL_FILE)
    logger.info("XGBoost model loaded from %s", MODEL_FILE)
    return _model


def _get_explainer():
    global _explainer
    if _explainer is not None:
        return _explainer
    try:
        import shap
        _explainer = shap.Explainer(_load_model())
        return _explainer
    except ImportError:
        return None


def _compute_engineered_features(stats: dict) -> dict:
    """Compute derived features from the 9 raw inputs."""
    stats["amount_deviation"] = round(
        stats["amount"] / (stats["avg_transaction_amount_7d"] + 1), 4
    )
    stats["velocity_ratio"] = round(
        stats["receiver_unique_senders_24h"] / (stats["receiver_tx_count_24h"] + 1), 4
    )
    stats["is_first_interaction"] = 1 if stats["previous_connections_count"] == 0 else 0
    return stats


def _risk_level(probability: float) -> str:
    if probability >= 0.80:
        return "HIGH"
    elif probability >= 0.50:
        return "MEDIUM"
    elif probability >= 0.25:
        return "LOW"
    return "SAFE"


def _build_explanation(stats: dict, shap_values) -> list[dict]:
    """Convert SHAP values to a human-readable explanation list."""
    sv = shap_values.values.flatten()
    explanation = []
    for name, impact in sorted(zip(ALL_FEATURES, sv), key=lambda x: -abs(x[1])):
        explanation.append({
            "feature": name,
            "value": stats.get(name),
            "impact": round(float(impact), 4),
        })
    return explanation


FEATURE_REASONS = {
    "receiver_unique_senders_24h": "High unique senders in last 24h",
    "previous_connections_count": "Low previous connections with sender",
    "receiver_account_age_days": "New account age",
    "receiver_report_count": "Multiple scam reports on receiver",
    "receiver_tx_count_24h": "Unusually high transaction volume",
    "amount": "Unusual transaction amount",
    "avg_transaction_amount_7d": "Amount deviates from recent average",
    "amount_deviation": "Spending pattern deviation detected",
    "velocity_ratio": "Abnormal sender-to-transaction ratio",
    "is_first_interaction": "First-time interaction with receiver",
    "hour_of_day": "Transaction at unusual hour",
    "is_weekend": "Weekend transaction pattern",
}


def predict_fraud(transaction_features: dict) -> dict:
    """
    Predict fraud risk for a single transaction.

    Accepts 9 raw features, computes engineered features internally,
    and returns probability, risk level, block decision, and explanation.
    """
    model = _load_model()
    stats = _compute_engineered_features(dict(transaction_features))

    input_df = pd.DataFrame([{col: stats[col] for col in ALL_FEATURES}])
    fraud_probability = float(model.predict_proba(input_df)[0][1])
    risk = _risk_level(fraud_probability)
    is_blocked = fraud_probability > FRAUD_THRESHOLD

    result = {
        "fraud_probability": round(fraud_probability, 4),
        "risk_level": risk,
        "is_blocked": is_blocked,
        "message": (
            "Transaction blocked due to high fraud risk."
            if is_blocked
            else "Transaction appears safe."
        ),
    }

    # SHAP explanation
    explainer = _get_explainer()
    if explainer is not None:
        shap_values = explainer(input_df)
        result["explanation"] = _build_explanation(stats, shap_values)

        # Top human-readable risk reasons (positive SHAP only)
        reasons = []
        sv = shap_values.values.flatten()
        for name, impact in sorted(zip(ALL_FEATURES, sv), key=lambda x: -x[1]):
            if impact > 0 and name in FEATURE_REASONS:
                reasons.append(FEATURE_REASONS[name])
            if len(reasons) >= 3:
                break
        result["risk_reasons"] = reasons
    else:
        result["explanation"] = []
        result["risk_reasons"] = []

    return result


# ── CLI ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json

    sample_suspicious = {
        "amount": 5000.00,
        "hour_of_day": 3,
        "is_weekend": 1,
        "receiver_account_age_days": 5,
        "receiver_report_count": 4,
        "receiver_tx_count_24h": 47,
        "receiver_unique_senders_24h": 30,
        "previous_connections_count": 0,
        "avg_transaction_amount_7d": 120.50,
    }

    sample_safe = {
        "amount": 200.00,
        "hour_of_day": 14,
        "is_weekend": 0,
        "receiver_account_age_days": 365,
        "receiver_report_count": 0,
        "receiver_tx_count_24h": 3,
        "receiver_unique_senders_24h": 2,
        "previous_connections_count": 15,
        "avg_transaction_amount_7d": 250.00,
    }

    print("=" * 60)
    print("SUSPICIOUS TRANSACTION")
    print("=" * 60)
    print(json.dumps(predict_fraud(sample_suspicious), indent=2))

    print("\n" + "=" * 60)
    print("SAFE TRANSACTION")
    print("=" * 60)
    print(json.dumps(predict_fraud(sample_safe), indent=2))
