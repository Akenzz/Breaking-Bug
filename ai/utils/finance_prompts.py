"""
Finance-related Gemini prompts for category classification and AI insight generation.
These prompts are used by the finance analyzer service to interact with the LLM.
"""

# ==================== CATEGORY CLASSIFICATION PROMPT ====================

CATEGORY_CLASSIFICATION_PROMPT = """You are a financial transaction categorizer.

Classify each of the following transaction descriptions into ONE of these categories:
- Food
- Travel
- Entertainment
- Utilities
- Shopping
- Others

RULES:
1. Return ONLY valid JSON — no explanations, no markdown, no extra text.
2. The JSON must map each description (exactly as given) to its category.
3. Do NOT invent new categories. Use only the six listed above.
4. If a description is ambiguous, pick the most likely category.

TRANSACTION DESCRIPTIONS:
{descriptions}

OUTPUT FORMAT (return exactly this structure):
{{
  "description1": "Category",
  "description2": "Category"
}}

Return ONLY the JSON object now."""


# ==================== AI INSIGHT GENERATION PROMPT ====================

AI_INSIGHT_PROMPT = """You are an expert personal finance advisor AI.

Analyze the following financial summary and generate actionable insights and saving suggestions.

FINANCIAL SUMMARY:
- Username: {username}
- Total Outgoing (Spent): {total_spending}
- Total Incoming (Received): {total_income}
- Net Cash Flow: {net_cash_flow}
- Number of Transactions: {transaction_count}
- Time Period: {time_period}
- Category Breakdown (outgoing only): {category_breakdown}
- Number of Anomalies Detected: {anomaly_count}
- Financial Health Score: {health_score}/100
- Predicted Next Spending: {predicted_spending}

RULES:
1. Return ONLY valid JSON — no explanations, no markdown, no extra text.
2. Generate 3 to 6 insights that are specific, actionable, and relevant.
3. Include spending pattern observations, category alerts, and saving suggestions.
4. Consider the balance between income and spending.
5. If anomalies were detected, mention them.
6. Reference actual numbers from the summary above.
7. Be concise but helpful.

OUTPUT FORMAT (return exactly this structure):
{{
  "insights": [
    "Insight or suggestion 1",
    "Insight or suggestion 2",
    "Insight or suggestion 3"
  ]
}}

Return ONLY the JSON object now."""


# ==================== ANOMALY EXPLANATION PROMPT ====================

ANOMALY_EXPLANATION_PROMPT = """You are a financial anomaly analyst AI.

The following transactions were flagged as anomalies by a Machine Learning model (IsolationForest).
For each anomaly, provide a concise, human-friendly explanation of WHY it might be unusual.

CONTEXT:
- User: {username}
- Average transaction amount: {avg_amount}
- Typical transaction hours: {typical_hours}
- These are the flagged transactions:

{anomaly_details}

RULES:
1. Return ONLY valid JSON — no explanations, no markdown, no extra text.
2. For each anomaly (identified by its index), provide a short explanation string.
3. Consider the amount vs average, the time of day, weekend vs weekday, and the description.
4. Mention if it looks like a one-time splurge, recurring large payment, odd-hour transaction, etc.
5. Be specific about what makes each one unusual.

OUTPUT FORMAT (return exactly this structure, keys are the anomaly indices as strings):
{{
  "0": "Explanation for first anomaly",
  "1": "Explanation for second anomaly"
}}

Return ONLY the JSON object now."""
