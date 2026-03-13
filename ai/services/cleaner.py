import re
import json
from typing import Optional, Dict, Any


class CleanerError(Exception):
    pass


class JSONCleaner:
    @staticmethod
    def remove_markdown_blocks(text: str) -> str:
        patterns = [
            r'```json\s*',
            r'```\s*',
            r'^`+',
            r'`+$'
        ]
        
        result = text.strip()
        for pattern in patterns:
            result = re.sub(pattern, '', result, flags=re.MULTILINE)
        
        return result.strip()
    
    @staticmethod
    def fix_trailing_commas(text: str) -> str:
        text = re.sub(r',\s*]', ']', text)
        text = re.sub(r',\s*}', '}', text)
        return text
    
    @staticmethod
    def fix_quotes(text: str) -> str:
        replacements = {
            '"': '"',
            '"': '"',
            ''': "'",
            ''': "'",
            '「': '"',
            '」': '"'
        }
        
        for smart, standard in replacements.items():
            text = text.replace(smart, standard)
        
        return text
    
    @staticmethod
    def extract_json_object(text: str) -> str:
        start = text.find('{')
        end = text.rfind('}')
        
        if start != -1 and end != -1 and end > start:
            return text[start:end + 1]
        
        return text
    
    def clean(self, raw_response: str) -> Dict[str, Any]:
        if not raw_response:
            raise CleanerError("Empty response received")
        
        cleaned = self.remove_markdown_blocks(raw_response)
        cleaned = self.fix_quotes(cleaned)
        cleaned = self.extract_json_object(cleaned)
        cleaned = self.fix_trailing_commas(cleaned)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise CleanerError(f"Invalid JSON response: {e}")
    
    def safe_clean(self, raw_response: str) -> Optional[Dict[str, Any]]:
        try:
            return self.clean(raw_response)
        except CleanerError:
            return None
