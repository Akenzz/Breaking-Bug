"""Fraud detection service : XGBoost inference with SHAP explanations."""

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

_model: xgb.XGBClassifier | None = None
_explainer = None

_FEATURE_COLUMNS = [
    "amount", "hour_of_day", "is_weekend",
    "receiver_account_age_days", "receiver_report_count",
    "receiver_tx_count_24h", "receiver_unique_senders_24h",
    "previous_connections_count", "avg_transaction_amount_7d",
    "amount_deviation", "velocity_ratio", "is_first_interaction",
]

_FEATURE_REASONS = {
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


def _load_model() -> xgb.XGBClassifier:
    global _model
    if _model is not None:
        return _model
    if not Path(MODEL_FILE).exists():
        raise FileNotFoundError(
            f"XGBoost fraud model not found at '{MODEL_FILE}'. "
            "Train first with fraud_ml/train_model.py or set FRAUD_MODEL_PATH."
        )
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


def _compute_engineered(stats: dict) -> dict:
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
    if probability >= 0.50:
        return "MEDIUM"
    if probability >= 0.25:
        return "LOW"
    return "SAFE"


def evaluate_risk(stats: dict) -> dict:
    """Evaluate fraud risk for a single transaction (9 raw features)."""
    model = _load_model()
    stats = _compute_engineered(dict(stats))

    input_df = pd.DataFrame([{col: stats[col] for col in _FEATURE_COLUMNS}])
    fraud_probability = float(model.predict_proba(input_df)[0][1])
    risk = _risk_level(fraud_probability)
    is_blocked = fraud_probability > FRAUD_THRESHOLD

    result = {
        "fraud_risk_score": round(fraud_probability, 4),
        "risk_level": risk,
        "is_blocked": is_blocked,
        "message": (
            "Transaction blocked due to high fraud risk."
            if is_blocked
            else "Transaction appears safe."
        ),
        "explanation": [],
        "risk_reasons": [],
    }

    explainer = _get_explainer()
    if explainer is not None:
        shap_values = explainer(input_df)
        sv = shap_values.values.flatten()

        result["explanation"] = [
            {"feature": name, "value": stats.get(name), "impact": round(float(impact), 4)}
            for name, impact in sorted(zip(_FEATURE_COLUMNS, sv), key=lambda x: -abs(x[1]))
        ]

        reasons = []
        for name, impact in sorted(zip(_FEATURE_COLUMNS, sv), key=lambda x: -x[1]):
            if impact > 0 and name in _FEATURE_REASONS:
                reasons.append(_FEATURE_REASONS[name])
            if len(reasons) >= 3:
                break
        result["risk_reasons"] = reasons

    return result
