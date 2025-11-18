from enum import Enum
from pydantic import BaseModel, Field

class QueryCategory(str, Enum):
    """Predefined categories for employee queries."""
    PAYROLL_FINANCE = "payroll_finance"
    IT_SUPPORT = "it_support"
    BENEFITS_LEAVE = "benefits_leave"
    WORKPLACE_GRIEVANCE = "workplace_grievance"
    POLICY_COMPLIANCE = "policy_compliance"
    GENERAL_INQUIRY = "general_inquiry"
    FEEDBACK_SUGGESTION = "feedback_suggestion"

class UrgencyLevel(str, Enum):
    """Urgency levels for triage."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Sentiment(str, Enum):
    """Detected sentiment of the query."""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class ClassificationResponse(BaseModel):
    """The structured analysis returned by the AI."""
    category: QueryCategory = Field(..., description="The most appropriate department/category for the query.")
    urgency: UrgencyLevel = Field(..., description="The implied urgency of the request.")
    sentiment: Sentiment = Field(..., description="The emotional tone of the query.")
    summary: str = Field(..., description="A concise, 1-sentence summary of the issue for a dashboard view.")
    reasoning: str = Field(..., description="Brief explanation of why this category and urgency were chosen.")