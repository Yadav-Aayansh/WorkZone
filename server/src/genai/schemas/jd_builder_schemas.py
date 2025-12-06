from typing import Optional
from pydantic import BaseModel, Field

class JDBuilderPrompt(BaseModel):
    """Input model for the JD generator."""
    prompt: str = Field(..., description="The user's short description of the role.")
    company_name: Optional[str] = Field(None, description="Optional company name to insert.")
    tone: str = Field("professional and enthusiastic", description="e.g., 'formal', 'casual', 'energetic'")

class GeneratedJD(BaseModel):
    """Output model containing the generated JD."""
    markdown_text: str

