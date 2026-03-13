import re
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal, InvalidOperation

VALID_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Utilities', 'Healthcare', 'Entertainment', 'Others']

CURRENCY_SYMBOLS = {
    '₹': 'INR',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    'Rs': 'INR',
    'Rs.': 'INR'
}


class ValidationError(Exception):
    pass


class BillValidator:
    
    def __init__(self):
        self.validation_warnings: List[str] = []
    
    def _reset_warnings(self) -> None:
        self.validation_warnings = []
    
    def _add_warning(self, message: str) -> None:
        self.validation_warnings.append(message)
    
    def validate_merchant(self, value: Any) -> str:
        if value is None or value == "":
            self._add_warning("Merchant name missing")
            return "Unknown Merchant"
        
        merchant = str(value).strip()
        merchant = ' '.join(merchant.split())
        
        if merchant.isupper() or merchant.islower():
            merchant = merchant.title()
        
        return merchant if merchant else "Unknown Merchant"
    
    def validate_date(self, value: Any) -> str:
        if value is None or value == "":
            self._add_warning("Date missing")
            return datetime.now().strftime("%Y-%m-%d")
        
        date_str = str(value).strip()
        
        date_formats = [
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%m/%d/%Y",
            "%Y/%m/%d",
            "%d %B %Y",
            "%d %b %Y",
            "%B %d, %Y",
            "%b %d, %Y",
            "%d.%m.%Y",
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str, fmt)
                return parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                continue
    
        date_pattern = r'(\d{1,4})[-/.\s](\d{1,2})[-/.\s](\d{1,4})'
        match = re.search(date_pattern, date_str)
        
        if match:
            parts = [int(p) for p in match.groups()]

            if parts[0] > 31:
                year, month, day = parts[0], parts[1], parts[2]
            elif parts[2] > 31:
                day, month, year = parts[0], parts[1], parts[2]
            else:
                day, month, year = parts[0], parts[1], parts[2]
                if year < 100:
                    year += 2000
            
            try:
                validated_date = datetime(year, month, day)
                return validated_date.strftime("%Y-%m-%d")
            except ValueError:
                pass
        
        self._add_warning(f"Could not parse date: {date_str}")
        return datetime.now().strftime("%Y-%m-%d")
    
    def validate_total(self, value: Any) -> float:
        if value is None or value == "":
            self._add_warning("Total amount missing")
            return 0.0
        
        if isinstance(value, (int, float)):
            return round(float(value), 2)
        
        value_str = str(value).strip()
        for symbol in CURRENCY_SYMBOLS.keys():
            value_str = value_str.replace(symbol, '')
        value_str = value_str.replace(',', '').replace(' ', '')
        
        try:
            total = float(Decimal(value_str))
            return round(total, 2)
        except (InvalidOperation, ValueError):
            self._add_warning(f"Could not parse total: {value}")
            return 0.0
    
    def validate_currency(self, value: Any) -> str:
        if value is None or value == "":
            self._add_warning("Currency missing, defaulting to INR")
            return "INR"
        
        currency = str(value).strip().upper()
        
        for symbol, code in CURRENCY_SYMBOLS.items():
            if symbol in currency:
                return code
        
        if len(currency) == 3 and currency.isalpha():
            return currency
        
        self._add_warning(f"Unknown currency: {value}, defaulting to INR")
        return "INR"
    
    def validate_category(self, value: Any) -> str:
        if value is None or value == "":
            self._add_warning("Category missing")
            return "Others"
        
        category = str(value).strip().title()
        
        if category in VALID_CATEGORIES:
            return category
        
        for valid_cat in VALID_CATEGORIES:
            if valid_cat.lower() in category.lower() or category.lower() in valid_cat.lower():
                return valid_cat
        
        self._add_warning(f"Unknown category: {value}, defaulting to Others")
        return "Others"
    
    def validate_item(self, item: Any) -> Optional[Dict[str, Any]]:
        if not isinstance(item, dict):
            return None
        
        name = item.get('name', '')
        price = item.get('price', 0)
        
        if not name or str(name).strip() == "":
            return None
        
        validated_name = str(name).strip()
        
        try:
            if isinstance(price, (int, float)):
                validated_price = round(float(price), 2)
            else:
                price_str = str(price).replace(',', '').strip()
                for symbol in CURRENCY_SYMBOLS.keys():
                    price_str = price_str.replace(symbol, '')
                validated_price = round(float(price_str), 2)
        except (ValueError, InvalidOperation):
            validated_price = 0.0
        
        return {
            "name": validated_name,
            "price": validated_price
        }
    
    def validate_items(self, items: Any) -> List[Dict[str, Any]]:
        if items is None or not isinstance(items, list):
            self._add_warning("Items list missing or invalid")
            return []
        
        validated_items = []
        for item in items:
            validated_item = self.validate_item(item)
            if validated_item:
                validated_items.append(validated_item)
        
        return validated_items
    
    def calculate_confidence(self, data: Dict[str, Any]) -> float:
        score = 1.0
        
        if data.get('merchant') == "Unknown Merchant":
            score -= 0.2
        
        if data.get('total', 0) == 0:
            score -= 0.3
        
        if not data.get('items'):
            score -= 0.1
        
        warning_penalty = len(self.validation_warnings) * 0.05
        score -= warning_penalty
        
        return round(max(0.0, min(1.0, score)), 2)
    
    def validate(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], float]:
        self._reset_warnings()
        
        if not isinstance(data, dict):
            raise ValidationError("Invalid data format: expected dictionary")
        
        validated = {
            "merchant": self.validate_merchant(data.get('merchant')),
            "date": self.validate_date(data.get('date')),
            "total": self.validate_total(data.get('total')),
            "currency": self.validate_currency(data.get('currency')),
            "category": self.validate_category(data.get('category')),
            "items": self.validate_items(data.get('items'))
        }
        
        confidence = self.calculate_confidence(validated)
        
        return validated, confidence
    
    def get_warnings(self) -> List[str]:
        return self.validation_warnings.copy()
