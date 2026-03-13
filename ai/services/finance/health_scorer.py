"""
Financial Health Scorer
========================
Calculates a 0-100 health score based on outgoing spending patterns.
Income vs expense is properly separated.
"""

from typing import Dict, Any

import numpy as np
import pandas as pd


def calculate_health_score(
    df: pd.DataFrame,
    categories: Dict[str, str],
    anomaly_count: int,
) -> Dict[str, Any]:
    """
    Calculate a financial health score (0-100) based on:
    - Spending consistency (low std dev is better)        — 30 pts
    - Spending spikes (fewer is better)                   — 25 pts
    - Category distribution (more diverse is better)      — 25 pts
    - Anomaly count (fewer is better)                     — 20 pts

    Only OUTGOING transactions count as "spending".
    INCOMING transactions are tracked as "income".

    Args:
        df:             DataFrame with preprocessed transactions.
        categories:     Mapping of descriptions to categories.
        anomaly_count:  Number of detected anomalies.

    Returns:
        Dict with score, grade, breakdown, and income/expense stats.
    """
    if df.empty:
        return {
            "score": 50,
            "breakdown": {},
            "grade": "N/A",
            "stats": {
                "total_spending": 0, "total_income": 0, "net_cash_flow": 0,
                "average_transaction": 0, "std_deviation": 0, "transaction_count": 0,
                "outgoing_count": 0, "incoming_count": 0,
            },
        }

    # Split outgoing (expense) and incoming (income)
    outgoing_df = df[df["is_outgoing"] == 1]
    incoming_df = df[df["is_outgoing"] == 0]

    total_spending = float(outgoing_df["amount"].sum()) if not outgoing_df.empty else 0.0
    total_income = float(incoming_df["amount"].sum()) if not incoming_df.empty else 0.0
    net_cash_flow = total_income - total_spending

    # Health score is based on OUTGOING spending patterns
    if not outgoing_df.empty:
        amounts = outgoing_df["amount"].values
        mean_amount = float(amounts.mean())
        std_amount = float(amounts.std()) if len(amounts) > 1 else 0
        n = len(amounts)
    else:
        amounts = np.array([])
        mean_amount = 0.0
        std_amount = 0.0
        n = 0

    total_n = len(df)

    # --- 1. Consistency score (30 pts) ---
    if mean_amount > 0:
        cv = std_amount / mean_amount
        consistency_score = max(0, 30 - int(cv * 30))
    else:
        consistency_score = 30

    # --- 2. Spike score (25 pts) ---
    if n > 0 and std_amount > 0:
        spike_threshold = mean_amount + 2 * std_amount
        spike_count = int(np.sum(amounts > spike_threshold))
        spike_ratio = spike_count / n
        spike_score = max(0, 25 - int(spike_ratio * 100))
    else:
        spike_score = 25

    # --- 3. Category diversity score (25 pts) ---
    unique_categories = set(categories.values()) if categories else set()
    cat_count = len(unique_categories)
    diversity_score = min(25, int((cat_count / 6) * 25))

    # --- 4. Anomaly penalty (20 pts) ---
    anomaly_ratio = anomaly_count / max(total_n, 1)
    anomaly_score = max(0, 20 - int(anomaly_ratio * 100))

    # Final score
    total_score = consistency_score + spike_score + diversity_score + anomaly_score
    total_score = max(0, min(100, total_score))

    # Grade assignment
    if total_score >= 85:
        grade = "Excellent"
    elif total_score >= 70:
        grade = "Good"
    elif total_score >= 50:
        grade = "Fair"
    elif total_score >= 30:
        grade = "Needs Improvement"
    else:
        grade = "Poor"

    return {
        "score": total_score,
        "grade": grade,
        "breakdown": {
            "consistency": {"score": consistency_score, "max": 30},
            "spike_control": {"score": spike_score, "max": 25},
            "category_diversity": {"score": diversity_score, "max": 25},
            "anomaly_penalty": {"score": anomaly_score, "max": 20},
        },
        "stats": {
            "total_spending": round(total_spending, 2),
            "total_income": round(total_income, 2),
            "net_cash_flow": round(net_cash_flow, 2),
            "average_transaction": round(mean_amount, 2),
            "std_deviation": round(std_amount, 2),
            "transaction_count": total_n,
            "outgoing_count": len(outgoing_df),
            "incoming_count": len(incoming_df),
        },
    }
