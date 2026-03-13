prompt = """You are an expert bill and receipt parser. Analyze this image and extract the following information.

IMPORTANT RULES:
1. Return ONLY valid JSON - no explanations, no markdown, no additional text
2. All numeric values (total, prices) must be numbers, NOT strings
3. Convert currency symbols to ISO codes: ₹ → INR, $ → USD, € → EUR, £ → GBP, ¥ → JPY
4. Date must be in YYYY-MM-DD format if possible
5. Detect category from: Food, Travel, Shopping, Utilities, Healthcare, Entertainment, Others
6. Extract all visible line items with their prices
7. If a field is not visible, use null

OUTPUT FORMAT (return exactly this structure):
{
  "merchant": "store or business name",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "currency": "INR",
  "category": "category name",
  "items": [
    {"name": "item description", "price": 0.00}
  ]
}

Extract the information from this bill/receipt image now. Return ONLY the JSON object."""