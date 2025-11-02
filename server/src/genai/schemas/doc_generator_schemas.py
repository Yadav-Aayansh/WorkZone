from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

class DocumentRequest(BaseModel):
    """Input model to request a document generation."""
    prompt_template: str = Field(..., description="The full, pre-approved prompt-template string from the backend.")
    data: Dict[str, Any] = Field(..., description="The key-value data to fill the template with.")

class GeneratedDocument(BaseModel):
    """Output model containing the generated document."""
    content: str = Field(..., description="The final generated document as a string (can be Markdown or plain text).")
