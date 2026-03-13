"""
Transaction Preprocessor
=========================
Feature engineering: converts raw transaction JSON into a ML-ready DataFrame.
"""

from datetime import datetime
from typing import Dict, Any, List

import pandas as pd


def preprocess_transactions(
    transactions: List[Dict[str, Any]],
    current_user: str,
) -> pd.DataFrame:
    """
    Create ML-ready features from raw transaction data.

    Features:
        - amount:        absolute transaction amount
        - signed_amount: negative for outgoing, positive for incoming
        - day_of_week:   0 (Mon) to 6 (Sun)
        - hour_of_day:   0-23
        - is_weekend:    1 if Saturday/Sunday, else 0
        - is_outgoing:   1 if money left the user, else 0

    Args:
        transactions: Raw transaction list.
        current_user: Username of the user being analyzed.

    Returns:
        DataFrame with engineered features.
    """
    records = []

    for tx in transactions:
        try:
            created_at = tx.get("createdAt", "")
            dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            dt = datetime.now()

        amount = float(tx.get("amount", 0))

        # fromUserName == current_user  →  money SENT (outgoing / expense)
        # toUserName   == current_user  →  money RECEIVED (incoming / income)
        is_outgoing = tx.get("fromUserName", "") == current_user
        signed_amount = -amount if is_outgoing else amount

        records.append({
            "amount": amount,
            "signed_amount": signed_amount,
            "day_of_week": dt.weekday(),
            "hour_of_day": dt.hour,
            "is_weekend": 1 if dt.weekday() >= 5 else 0,
            "is_outgoing": 1 if is_outgoing else 0,
            "description": tx.get("description", ""),
            "createdAt": created_at,
            "fromUserName": tx.get("fromUserName", ""),
            "toUserName": tx.get("toUserName", ""),
        })

    return pd.DataFrame(records)
