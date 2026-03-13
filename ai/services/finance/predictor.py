"""
Spending Predictor
===================
Predicts future spending using Linear Regression on recent OUTGOING transactions.
"""

from typing import Dict, Any

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_spending(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Predict the next outgoing transaction amount using Linear Regression.
    Only outgoing (expense) transactions are considered.

    The model fits a line across the sequential outgoing amounts
    (X = transaction index, y = amount) and predicts the next point.

    Args:
        df: DataFrame with amount and is_outgoing columns.

    Returns:
        Dict with predicted amount, method, trend, model confidence, etc.
    """
    # Filter to outgoing transactions only
    outgoing = df[df["is_outgoing"] == 1] if not df.empty else df

    if outgoing.empty:
        return {
            "predicted_next_amount": 0.0,
            "method": "linear_regression",
            "trend": "stable",
            "data_points_used": 0,
            "model_confidence_r2": 0.0,
            "recent_average": 0.0,
        }

    amounts = outgoing["amount"].values
    n = len(amounts)

    # Need at least 2 data points to fit a line
    if n < 2:
        return {
            "predicted_next_amount": round(float(amounts[0]), 2),
            "method": "linear_regression",
            "trend": "stable",
            "data_points_used": n,
            "model_confidence_r2": 0.0,
            "recent_average": round(float(amounts[0]), 2),
        }

    # X = sequential index (0, 1, 2, ..., n-1), y = amount
    X = np.arange(n).reshape(-1, 1)
    y = amounts

    model = LinearRegression()
    model.fit(X, y)

    # Predict the next point (index = n)
    next_index = np.array([[n]])
    predicted = float(model.predict(next_index)[0])

    # R² score — how well the line fits the data
    r2 = float(model.score(X, y))

    # Don't predict negative spending
    predicted = max(0.0, predicted)

    # Trend from the slope of the regression line
    slope = float(model.coef_[0])
    mean_amount = float(amounts.mean())

    if mean_amount > 0:
        # Normalised slope: % change per transaction
        relative_slope = slope / mean_amount
        if relative_slope > 0.05:
            trend = "increasing"
        elif relative_slope < -0.05:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return {
        "predicted_next_amount": round(predicted, 2),
        "method": "linear_regression",
        "trend": trend,
        "data_points_used": n,
        "model_confidence_r2": round(r2, 4),
        "recent_average": round(float(amounts[-5:].mean()), 2),
    }
