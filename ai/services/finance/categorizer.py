"""
Transaction Categorizer
"""

import json
import logging
from typing import Dict, Any, List

from google.genai import errors as genai_errors

from services.cleaner import JSONCleaner, CleanerError
from utils.finance_prompts import CATEGORY_CLASSIFICATION_PROMPT

logger = logging.getLogger(__name__)

# Valid categories the LLM may return
VALID_CATEGORIES = {"Food", "Travel", "Entertainment", "Utilities", "Shopping", "Others"}


def categorize_transactions(
    client,
    model_name: str,
    cleaner: JSONCleaner,
    transactions: List[Dict[str, Any]],
) -> Dict[str, str]:
    """
    Send unique transaction descriptions to Gemini and return a
    description → category mapping.

    Args:
        client:       google.genai.Client instance.
        model_name:   Gemini model name.
        cleaner:      JSONCleaner instance for response parsing.
        transactions: List of transaction dicts with 'description' field.

    Returns:
        Dict mapping each description to its category.
    """
    
    descriptions = list({tx.get("description", "unknown") for tx in transactions})

    if not descriptions:
        return {}

    descriptions_text = "\n".join(f"- {desc}" for desc in descriptions)
    prompt = CATEGORY_CLASSIFICATION_PROMPT.format(descriptions=descriptions_text)

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        if not response.text:
            logger.warning("Empty response from Gemini for category classification")
            return {desc: "Others" for desc in descriptions}

        categories = cleaner.clean(response.text)

        # Validate: ensure every description has a valid category
        result = {}
        for desc in descriptions:
            cat = categories.get(desc, "Others")
            result[desc] = cat if cat in VALID_CATEGORIES else "Others"

        return result

    except (CleanerError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse category response: {e}")
        return {desc: "Others" for desc in descriptions}
    except genai_errors.ClientError as e:
        from services.finance.analyzer import FinanceAnalyzerError
        raise FinanceAnalyzerError(f"Gemini API error during categorization: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in categorize_transactions: {e}")
        return {desc: "Others" for desc in descriptions}
