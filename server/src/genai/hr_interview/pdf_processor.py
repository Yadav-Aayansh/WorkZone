import io
import PyPDF2

# OCR imports (optional)
try:
    from PIL import Image
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: OCR libraries not available")

# Conditional import for testing without full config
try:
    from src.core.storage import storage_client
    STORAGE_AVAILABLE = True
except Exception as e:
    STORAGE_AVAILABLE = False
    print(f"Warning: Storage client not available: {e}")

# Import shared HTTP client
# try:
from src.genai.http_client import http_client
# except ImportError:
#     from http_client import http_client  # Fallback for testing


async def extract_text_from_pdf(pdf_url: str) -> str:
    try:
        # Download PDF from signed URL using shared httpx client
        client = http_client.get_client()
        response = await client.get(pdf_url)
        response.raise_for_status()
        pdf_content = response.content
        
        # Step 1: Extract text from PDF text layer
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        # Step 2: OCR extraction for image-based PDFs
        if OCR_AVAILABLE and len(text.strip()) < 100:
            try:
                images = convert_from_bytes(pdf_content)
                for i, image in enumerate(images):
                    ocr_text = pytesseract.image_to_string(image)
                    if ocr_text.strip():
                        text += f"\n[OCR Page {i+1}]\n{ocr_text}\n"
            except Exception as ocr_error:
                print(f"OCR extraction warning: {ocr_error}")
        
        return text.strip()
    
    except Exception as e:
        raise Exception(f"Failed to parse PDF: {str(e)}")
