"""
PDF Processing Module
Handles PDF text extraction with OCR support
"""

import io
import PyPDF2
from typing import BinaryIO

# OCR imports (optional)
try:
    from PIL import Image
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠ Warning: OCR libraries not available")


def extract_text_from_pdf(pdf_content: bytes) -> str:
    
    try:
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


# Testing the module

if __name__ == "__main__":
    print("Testing PDF Processor Module")
    print("=" * 60)
    
    # Test with a sample PDF path
    test_pdf_path = "test_pdf/JD(image).pdf"
    
    try:
        with open(test_pdf_path, "rb") as f:
            pdf_content = f.read()
        
        text = extract_text_from_pdf(pdf_content)
        print(f"✓ Successfully extracted {len(text)} characters")
        print("\nFirst 200 characters:")
        print(text[:200])
        print("...")
        
    except FileNotFoundError:
        print(f"✗ Test file '{test_pdf_path}' not found")
        print("Please provide a test PDF file to run the test")
    except Exception as e:
        print(f"✗ Error: {e}")
