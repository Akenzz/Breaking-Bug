import io
import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any

from fastapi import UploadFile
from PIL import Image


ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
ALLOWED_CONTENT_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/bmp', 'image/webp'
}
MAX_FILE_SIZE = 10 * 1024 * 1024


class FileHandlerError(Exception):
    """Custom exception for file handling errors."""
    pass


class FileHandler:
    
    def __init__(self):
        pass
    
    def _validate_extension(self, filename: str) -> bool:
        """
        Validate file extension is allowed.
        
        Args:
            filename: Name of the uploaded file
            
        Returns:
            True if extension is valid, False otherwise
        """
        ext = Path(filename).suffix.lower()
        return ext in ALLOWED_EXTENSIONS
    
    def _validate_content_type(self, content_type: str) -> bool:
        """
        Validate content type is allowed.
        
        Args:
            content_type: MIME type of the file
            
        Returns:
            True if content type is valid, False otherwise
        """
        return content_type in ALLOWED_CONTENT_TYPES
    
    def _validate_image_bytes(self, content: bytes) -> Image.Image:
        """
        Validate that bytes represent a valid image and return PIL Image.
        
        Args:
            content: Raw image bytes
            
        Returns:
            PIL Image object
            
        Raises:
            FileHandlerError: If image is invalid
        """
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
            image = Image.open(io.BytesIO(content))
            return image
        except Exception:
            raise FileHandlerError("Invalid or corrupted image file")
    
    def generate_hash_from_bytes(self, content: bytes) -> str:
        """
        Generate SHA256 hash from bytes for duplicate detection.
        
        Args:
            content: Raw file bytes
            
        Returns:
            SHA256 hash string
        """
        return hashlib.sha256(content).hexdigest()
    
    async def process_upload(self, file: UploadFile) -> Tuple[Image.Image, str, bytes]:
        """
        Process uploaded file in memory and validate it.
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            Tuple of (PIL Image, file_hash, raw_bytes)
            
        Raises:
            FileHandlerError: If file validation fails
        """
        # Validate filename exists
        if not file.filename:
            raise FileHandlerError("No filename provided")
        
        if not self._validate_extension(file.filename):
            raise FileHandlerError(
                f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        if file.content_type and not self._validate_content_type(file.content_type):
            pass
        
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise FileHandlerError(
                f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        if len(content) == 0:
            raise FileHandlerError("Empty file uploaded")
        
        image = self._validate_image_bytes(content)
        
        if image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
        
        file_hash = self.generate_hash_from_bytes(content)
        
        return image, file_hash, content
    
    def get_image_info(self, image: Image.Image, size_bytes: int) -> Dict[str, Any]:
        """
        Get image metadata from PIL Image.
        
        Args:
            image: PIL Image object
            size_bytes: Size of the original file in bytes
            
        Returns:
            Dictionary with image information
        """
        try:
            return {
                "format": image.format,
                "mode": image.mode,
                "width": image.width,
                "height": image.height,
                "size_bytes": size_bytes
            }
        except Exception:
            return {}
