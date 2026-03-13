"""
AI Insight Generator
=====================
Uses Gemini LLM to generate personalized financial insights and saving
suggestions based on aggregated analysis data.
"""

import json
import logging
from typing import Dict, List

from google.genai import errors as genai_errors

from services.cleaner import JSONCleaner, CleanerError
from utils.finance_prompts import AI_INSIGHT_PROMPT

logger = logging.getLogger(__name__)


def generate_insights(
    client,
    model_name: str,
    cleaner: JSONCleaner,
    *,
    username: str,
    total_spending: float,
    total_income: float,
    net_cash_flow: float,
    transaction_count: int,
    category_breakdown: Dict[str, float],
    anomaly_count: int,
    health_score: int,
    predicted_spending: float,
    time_period: str = "recent",
) -> List[str]:
    """
    Ask Gemini for 3-6 actionable insights derived from all computed metrics.

    Args:
        client:             google.genai.Client instance.
        model_name:         Gemini model name.
        cleaner:            JSONCleaner instance.
        username:           User's name.
        total_spending:     Total outgoing amount.
        total_income:       Total incoming amount.
        net_cash_flow:      income - spending.
        transaction_count:  Number of transactions.
        category_breakdown: Category → total amount (outgoing only).
        anomaly_count:      Number of anomalies detected.
        health_score:       Financial health score (0-100).
        predicted_spending: Predicted next transaction amount.
        time_period:        Time period string.

    Returns:
        List of insight strings.
    """
    
    cat_text = ", ".join(f"{cat}: {amt:.2f}" for cat, amt in category_breakdown.items())
    if not cat_text:
        cat_text = "No category data available"

    prompt = AI_INSIGHT_PROMPT.format(
        username=username,
        total_spending=f"{total_spending:.2f}",
        total_income=f"{total_income:.2f}",
        net_cash_flow=f"{net_cash_flow:.2f}",
        transaction_count=transaction_count,
        time_period=time_period,
        category_breakdown=cat_text,
        anomaly_count=anomaly_count,
        health_score=health_score,
        predicted_spending=f"{predicted_spending:.2f}",
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        if not response.text:
            logger.warning("Empty response from Gemini for insights")
            return ["Unable to generate insights at this time."]

        parsed = cleaner.clean(response.text)
        insights = parsed.get("insights", [])

        if not isinstance(insights, list):
            return ["Unable to generate insights at this time."]

        return [str(i) for i in insights if i]

    except (CleanerError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse insight response: {e}")
        return ["Unable to parse AI-generated insights. Please try again."]
    except genai_errors.ClientError as e:
        from services.finance.analyzer import FinanceAnalyzerError
        raise FinanceAnalyzerError(f"Gemini API error during insight generation: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in generate_insights: {e}")
        return ["An error occurred while generating insights."]
