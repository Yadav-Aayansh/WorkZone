import io
import PyPDF2
import requests

# OCR imports (optional)
try:
    from PIL import Image
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠ Warning: OCR libraries not available")

# Conditional import for testing without full config
try:
    from src.core.storage import storage_client
    STORAGE_AVAILABLE = True
except Exception as e:
    STORAGE_AVAILABLE = False
    print(f"⚠ Warning: Storage client not available: {e}")

# OCR imports (optional)
try:
    from PIL import Image
    import pytesseract
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠ Warning: OCR libraries not available")


def extract_text_from_pdf(pdf_url: str) -> str:

    try:
        # Download PDF from signed URL
        response = requests.get(pdf_url)
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


# Testing the module

if __name__ == "__main__":
    print("Testing PDF Processor Module")
    print("=" * 60)
    
    # Test with storage client to get signed URL
    if STORAGE_AVAILABLE:
        print("\n✓ Storage client available")
        print("\nTesting with GCP Storage files...")
        print("-" * 60)
        
        # Test files from your bucket
        test_blob_names = [
            "jd/JD.pdf",
            "jd/JD(image).pdf"
        ]
        
        for blob_name in test_blob_names:
            print(f"\nTesting: {blob_name}")
            try:
                # Get signed URL from blob name
                signed_url = storage_client.get_url(blob_name, expiration=1)
                
                if not signed_url:
                    print(f"  ✗ File not found: {blob_name}")
                    continue
                
                print(f"  ✓ Generated signed URL")
                
                # Extract text
                text = extract_text_from_pdf(signed_url)
                print(f"  ✓ Successfully extracted {len(text)} characters")
                print(f"\n  First 200 characters:")
                print(f"  {text[:200]}...")
                
            except Exception as e:
                print(f"  ✗ Error: {e}")
    else:
        print("\n⚠ Storage client not available")
        print("\nTesting with public PDF URL...")
        print("-" * 60)
        
        # Test with a public PDF
        test_url = "gs://workzone-interview/jd/JD.pdf"
        
        try:
            text = extract_text_from_pdf(test_url)
            print(f"✓ Successfully extracted {len(text)} characters")
            print("\nFirst 200 characters:")
            print(text[:200])
            print("...")
            
        except Exception as e:
            print(f"✗ Error: {e}")
            print("\nTo test with GCP Storage:")
            print("  1. Ensure config.py has Google Cloud settings")
            print("  2. Set environment variables or update config.py directly")








