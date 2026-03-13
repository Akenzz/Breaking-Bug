"""
Anomaly Detector
=================
ML-based anomaly detection using IsolationForest.
LLM-based anomaly explanation using Gemini.

Requires at least MIN_TRANSACTIONS_FOR_ANOMALY transactions to run;
otherwise returns a helpful message instead of empty results.
"""

import json
import logging
from typing import Dict, Any, List

import pandas as pd
from sklearn.ensemble import IsolationForest

from google.genai import errors as genai_errors

from services.cleaner import JSONCleaner, CleanerError
from utils.finance_prompts import ANOMALY_EXPLANATION_PROMPT

logger = logging.getLogger(__name__)

# Minimum number of transactions required for meaningful anomaly detection
MIN_TRANSACTIONS_FOR_ANOMALY = 25


def detect_anomalies(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Use IsolationForest to detect unusual spending patterns.

    If fewer than MIN_TRANSACTIONS_FOR_ANOMALY rows are present, anomaly
    detection is skipped and a user-friendly message is returned instead.

    Args:
        df: DataFrame with engineered features.

    Returns:
        Dict with keys:
            - "anomalies":           list of anomaly dicts
            - "anomaly_skipped":     bool — True if detection was skipped
            - "anomaly_skip_reason": str  — human-readable reason (empty when not skipped)
    """
    total = len(df) if not df.empty else 0

    # ---- Guard: not enough data ----
    if total < MIN_TRANSACTIONS_FOR_ANOMALY:
        remaining = MIN_TRANSACTIONS_FOR_ANOMALY - total
        return {
            "anomalies": [],
            "anomaly_skipped": True,
            "anomaly_skip_reason": (
                f"Anomaly detection requires at least {MIN_TRANSACTIONS_FOR_ANOMALY} "
                f"transactions for accurate results. You currently have {total} "
                f"need {remaining} more. Keep transacting and check back soon!"
            ),
        }

    # ---- If enough data run IsolationForest ----
    feature_cols = ["amount", "day_of_week", "hour_of_day", "is_weekend", "is_outgoing"]
    X = df[feature_cols].values

    # Contamination = expected fraction of anomalies
    contamination = min(0.15, max(0.05, 2 / len(df)))

    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
    )
    predictions = model.fit_predict(X)
    scores = model.decision_function(X)

    anomalies: List[Dict[str, Any]] = []

    for i, (pred, score) in enumerate(zip(predictions, scores)):
        if pred == -1:  # Anomaly detected
            row = df.iloc[i]
            direction = (
                "outgoing (expense)" if row["is_outgoing"] == 1 else "incoming (received)"
            )

            anomalies.append({
                "description": row.get("description", "N/A"),
                "amount": float(row["amount"]),
                "date": row.get("createdAt", ""),
                "from": row.get("fromUserName", ""),
                "to": row.get("toUserName", ""),
                "direction": direction,
                "anomaly_score": round(float(score), 4),
                "reason": "", 
            })

    return {
        "anomalies": anomalies,
        "anomaly_skipped": False,
        "anomaly_skip_reason": "",
    }


def explain_anomalies(
    client,
    model_name: str,
    cleaner: JSONCleaner,
    anomalies: List[Dict[str, Any]],
    username: str,
    avg_amount: float,
    typical_hours: str,
) -> List[Dict[str, Any]]:
    """
    Use Gemini LLM to generate human-friendly explanations for each anomaly.

    Args:
        client:        google.genai.Client instance.
        model_name:    Gemini model name.
        cleaner:       JSONCleaner instance for response parsing.
        anomalies:     List of anomaly dicts from detect_anomalies().
        username:      Current user's username.
        avg_amount:    Average transaction amount for context.
        typical_hours: String describing typical transaction hours.

    Returns:
        Same anomaly list with the 'reason' field filled by the LLM.
    """
    if not anomalies:
        return anomalies

    details_lines = []
    for idx, a in enumerate(anomalies):
        details_lines.append(
            f"[{idx}] amount={a['amount']:.2f}, description=\"{a['description']}\", "
            f"direction={a['direction']}, date={a['date']}, "
            f"from={a['from']}, to={a['to']}"
        )
    anomaly_details = "\n".join(details_lines)

    prompt = ANOMALY_EXPLANATION_PROMPT.format(
        username=username,
        avg_amount=f"{avg_amount:.2f}",
        typical_hours=typical_hours,
        anomaly_details=anomaly_details,
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        if not response.text:
            logger.warning("Empty response from Gemini for anomaly explanations")
            for a in anomalies:
                a["reason"] = "Flagged as unusual by ML anomaly detection model."
            return anomalies

        parsed = cleaner.clean(response.text)

        # Fill in the reason from the LLM response
        for idx, a in enumerate(anomalies):
            llm_reason = parsed.get(str(idx), "")
            a["reason"] = llm_reason if llm_reason else "Flagged as unusual by ML anomaly detection model."

    except (CleanerError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse anomaly explanation response: {e}")
        for a in anomalies:
            a["reason"] = "Flagged as unusual by ML anomaly detection model."
    except genai_errors.ClientError as e:
        logger.error(f"Gemini API error for anomaly explanation: {e}")
        for a in anomalies:
            a["reason"] = "Flagged as unusual by ML anomaly detection model."
    except Exception as e:
        logger.error(f"Unexpected error in explain_anomalies: {e}")
        for a in anomalies:
            a["reason"] = "Flagged as unusual by ML anomaly detection model."

    return anomalies
