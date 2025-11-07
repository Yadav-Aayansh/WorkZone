from typing import Optional, Literal, Union, Annotated
from pydantic import BaseModel, Field

class OfferLetterData(BaseModel):
    """Specific data required to generate an offer letter."""
    doc_type: Literal["offer_letter"] = "offer_letter"
    candidate_name: str
    company_name: str
    position: str
    salary: str = Field(..., description="Full salary, e.g., '$100,000 per annum' or '₹35,00,000 LPA'")
    start_date: str = Field(..., description="e.g., 'December 1, 2025'")
    manager_name: Optional[str] = None

class RejectionLetterData(BaseModel):
    """Specific data required to generate a rejection letter."""
    doc_type: Literal["rejection_letter"] = "rejection_letter"
    candidate_name: str
    company_name: str
    position: str

class PolicyUpdateData(BaseModel):
    """Specific data required to generate a policy update email."""
    doc_type: Literal["policy_update"] = "policy_update"
    policy_name: str = Field(..., description="The name of the policy, e.g., 'Remote Work Policy'")
    policy_changes: str = Field(..., description="A summary of the changes, can be plain text or markdown.")
    company_name: str

# This Annotated Union is the request body.
# Pydantic will automatically validate against one of the models
# based on the 'doc_type' field.
DocumentRequest = Annotated[
    Union[OfferLetterData, RejectionLetterData, PolicyUpdateData],
    Field(discriminator="doc_type")
]

class GeneratedEmail(BaseModel):
    """Output model containing the generated HTML email."""
    html_content: str = Field(..., description="The full HTML content of the generated email.")