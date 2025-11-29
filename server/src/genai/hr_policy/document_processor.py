import io
import PyPDF2
from typing import List, Dict
from src.core.logger import logger
from src.core.storage import storage_client
from src.genai.schemas.hr_policy import DocumentChunk


async def download_pdf_from_gcs(blob_name: str) -> bytes:
    try:
        # Get signed URL
        signed_url = storage_client.get_url(blob_name, expiration=1)
        if not signed_url:
            raise ValueError(f"Document not found: {blob_name}")
        
        # Download using httpx
        from src.genai.http_client import http_client
        client = http_client.get_client()
        
        response = await client.get(signed_url)
        response.raise_for_status()
        
        logger.info(f"Downloaded PDF from GCS: {blob_name}")
        return response.content
        
    except Exception as e:
        logger.error(f"Failed to download PDF: {e}")
        raise


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n\n--- Page {page_num + 1} ---\n\n{page_text}"
        
        logger.info(f" Extracted text from PDF: {len(text)} characters")
        return text.strip()
        
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise


def chunk_text(
    text: str,
    source_filename: str,
    category: str,
    metadata: Dict,
    chunk_size: int = 500,
    overlap: int = 50
) -> List[DocumentChunk]:
    
    chunks = []
    
    # Simple chunking by characters
    start = 0
    chunk_index = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence boundary
        if end < len(text):
            last_period = text[max(start, end-100):end].rfind('.')
            if last_period != -1:
                end = max(start, end-100) + last_period + 1
        
        chunk_text = text[start:end].strip()
        
        if chunk_text:
            chunk = DocumentChunk(
                text=chunk_text,
                metadata={
                    "source": source_filename,
                    "category": category,
                    "chunk_index": chunk_index,
                    "total_chars": len(chunk_text),
                    **metadata
                }
            )
            chunks.append(chunk)
            chunk_index += 1
        
        start = end - overlap
    
    logger.info(f"Created {len(chunks)} chunks from document")
    return chunks