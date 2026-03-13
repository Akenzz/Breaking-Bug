import os
from typing import Dict, Any, Optional
from google import genai
from google.genai import types, errors
from PIL import Image
from utils.prompt import prompt

from services.cleaner import JSONCleaner, CleanerError
from services.validator import BillValidator, ValidationError


class GeminiParserError(Exception):
    """Custom exception for Gemini parsing errors."""
    pass


class GeminiParser:
    
    EXTRACTION_PROMPT = prompt

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            raise GeminiParserError(
                "Google API key not provided. Set GOOGLE_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        self.model_name = model_name
        self._configure_api()
        self.cleaner = JSONCleaner()
        self.validator = BillValidator()
    
    def _configure_api(self) -> None:
        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            raise GeminiParserError(f"Failed to configure Gemini API: {e}")
    
    def _prepare_image(self, image: Image.Image) -> Image.Image:
        if image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
        return image
    
    def _send_to_gemini(self, image: Image.Image, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, image]
            )
            
            if not response.text:
                raise GeminiParserError("Empty response from Gemini API")
            
            return response.text
            
        except errors.ClientError as e:
            raise GeminiParserError(f"Gemini API Client Error: {e}")
        except Exception as e:
            raise GeminiParserError(f"Gemini API error: {e}")
    
    def parse_bill(
        self, 
        image: Image.Image, 
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        
        prepared_image = self._prepare_image(image)
        prompt = custom_prompt or self.EXTRACTION_PROMPT
        raw_response = self._send_to_gemini(prepared_image, prompt)
        
        try:
            parsed_data = self.cleaner.clean(raw_response)
            validated_data, confidence = self.validator.validate(parsed_data)
            
            return {
                "data": validated_data,
                "confidence": confidence,
                "warnings": self.validator.get_warnings(),
                "raw_response": raw_response
            }
            
        except (CleanerError, ValidationError) as e:
            raise GeminiParserError(f"Processing error: {str(e)}")
        except Exception as e:
            raise GeminiParserError(f"Unexpected error: {str(e)}")

    def test_connection(self) -> bool:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="Hello, are you online?"
            )
            return bool(response.text)
        except Exception:
            return False
