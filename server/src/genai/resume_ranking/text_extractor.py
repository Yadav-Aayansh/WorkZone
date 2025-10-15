import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

def extract_text_from_file(file_path: str) -> str:
    if not file_path.lower().endswith('.pdf'):
        raise ValueError("Unsupported file type. Only PDF is supported for now.")

    full_text = ""
    try:
        doc = fitz.open(file_path)
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            page_text = page.get_text("text")

            if len(page_text.strip()) < 100:
                print(f"Page {page_num + 1} seems to be a scanned image. Using OCR.")
                
                pix = page.get_pixmap(dpi=300) 
                
                img_data = pix.tobytes("ppm")
                image = Image.open(io.BytesIO(img_data))
                
                ocr_text = pytesseract.image_to_string(image, lang='eng')
                full_text += ocr_text + "\n"
            else:
                full_text += page_text + "\n"

        doc.close()
    
    except Exception as e:
        print(f"An error occurred while processing {file_path}: {e}")
        return "" 

    return full_text

if __name__ == '__main__':
    resume_path = r"D:\Shreyas\Resumes\Shreyas_Jani_Resume_Sept2025.pdf" 
    
    try:
        extracted_text = extract_text_from_file(resume_path)
        print("--- EXTRACTED TEXT ---")
        print(extracted_text)
        print("\n--- EXTRACTION COMPLETE ---")
    except FileNotFoundError:
        print(f"Error: The file '{resume_path}' was not found. Please place a sample PDF in the same directory to test.")
    except ValueError as ve:
        print(ve)