"""
Finance Analyzer — Main Orchestrator
======================================
Thin orchestrator that wires together all finance sub-modules into a
single analysis pipeline.  Each step is implemented in its own module
for maintainability.

Pipeline:
 1.  Preprocess transactions         → preprocessor.py
 2.  Categorize via LLM              → categorizer.py
 3.  Detect anomalies via ML         → anomaly_detector.py
 4.  Explain anomalies via LLM       → anomaly_detector.py
 5.  Build category breakdown
 6.  Analyze top recipients           → recipients.py
 7.  Calculate health score           → health_scorer.py
 8.  Predict future spending          → predictor.py
 9.  Determine time period
 10. Generate AI insights             → insight_generator.py
"""

import os
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from google import genai

from services.cleaner import JSONCleaner

# Import each component module
from services.finance.preprocessor import preprocess_transactions
from services.finance.categorizer import categorize_transactions
from services.finance.anomaly_detector import detect_anomalies, explain_anomalies
from services.finance.health_scorer import calculate_health_score
from services.finance.predictor import predict_spending
from services.finance.recipients import analyze_top_recipients
from services.finance.insight_generator import generate_insights

logger = logging.getLogger(__name__)


class FinanceAnalyzerError(Exception):
    """Custom exception for finance analysis errors."""
    pass


class FinanceAnalyzer:
    """
    Main service class that orchestrates all financial analysis modules.
    Uses Gemini LLM for category detection and insight generation,
    and scikit-learn for anomaly detection.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-2.5-flash",
    ):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")

        if not self.api_key:
            raise FinanceAnalyzerError(
                "Google API key not provided. Set GOOGLE_API_KEY environment variable "
                "or pass api_key parameter."
            )

        self.model_name = model_name
        self.client = genai.Client(api_key=self.api_key)
        self.cleaner = JSONCleaner()

    # ------------------------------------------------------------------ #
    #                      FULL ANALYSIS PIPELINE                         #
    # ------------------------------------------------------------------ #

    def analyze(
        self,
        transactions: List[Dict[str, Any]],
        username: str,
    ) -> Dict[str, Any]:
        """
        Run the complete financial analysis pipeline.

        Args:
            transactions: List of transaction dicts.
            username:     Current user's username.

        Returns:
            Full analysis result dict.
        """
        if not transactions:
            raise FinanceAnalyzerError("No transactions provided for analysis.")

        # Step 1: Feature engineering
        df = preprocess_transactions(transactions, username)

        # Step 2: LLM-based category detection
        categories = categorize_transactions(
            self.client, self.model_name, self.cleaner, transactions,
        )

        # Step 3 + 4: Anomaly detection (ML) + LLM explanations
        anomaly_result = detect_anomalies(df)
        anomalies = anomaly_result["anomalies"]
        anomaly_skipped = anomaly_result["anomaly_skipped"]
        anomaly_skip_reason = anomaly_result["anomaly_skip_reason"]

        if anomalies and not anomaly_skipped:
            # Compute context for LLM explanations
            avg_amount = float(df["amount"].mean()) if not df.empty else 0.0
            if not df.empty:
                hour_counts = df["hour_of_day"].value_counts().head(3)
                typical_hours = ", ".join(f"{int(h)}:00" for h in hour_counts.index)
            else:
                typical_hours = "N/A"

            anomalies = explain_anomalies(
                self.client, self.model_name, self.cleaner,
                anomalies, username, avg_amount, typical_hours,
            )

        # Step 5: Build category breakdown — OUTGOING transactions only
        category_totals: Dict[str, float] = {}
        for tx in transactions:
            if tx.get("fromUserName", "") != username:
                continue
            desc = tx.get("description", "unknown")
            cat = categories.get(desc, "Others")
            amount = float(tx.get("amount", 0))
            category_totals[cat] = category_totals.get(cat, 0) + amount

        # Step 6: Top recipients analysis
        top_recipients = analyze_top_recipients(transactions, username, categories)

        # Step 7: Financial health score
        health = calculate_health_score(df, categories, len(anomalies))

        # Step 8: Future spending prediction (outgoing only)
        prediction = predict_spending(df)

        # Step 9: Determine time period from transactions
        try:
            dates = [
                datetime.fromisoformat(tx["createdAt"].replace("Z", "+00:00"))
                for tx in transactions
                if "createdAt" in tx
            ]
            if dates:
                min_date = min(dates).strftime("%Y-%m-%d")
                max_date = max(dates).strftime("%Y-%m-%d")
                time_period = f"{min_date} to {max_date}"
            else:
                time_period = "recent"
        except Exception:
            time_period = "recent"

        # Step 10: AI insight generation (LLM)
        insights = generate_insights(
            self.client,
            self.model_name,
            self.cleaner,
            username=username,
            total_spending=health["stats"]["total_spending"],
            total_income=health["stats"]["total_income"],
            net_cash_flow=health["stats"]["net_cash_flow"],
            transaction_count=health["stats"]["transaction_count"],
            category_breakdown=category_totals,
            anomaly_count=len(anomalies),
            health_score=health["score"],
            predicted_spending=prediction["predicted_next_amount"],
            time_period=time_period,
        )

        # Compose final response
        return {
            "health_score": health["score"],
            "health_grade": health["grade"],
            "health_breakdown": health["breakdown"],
            "health_stats": health["stats"],
            "prediction": prediction,
            "anomalies": anomalies,
            "anomaly_skipped": anomaly_skipped,
            "anomaly_skip_reason": anomaly_skip_reason,
            "categories": categories,
            "category_totals": category_totals,
            "top_recipients": top_recipients,
            "insights": insights,
        }
