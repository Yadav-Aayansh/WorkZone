from typing import List, Dict
from pydantic import BaseModel, Field

class ResumeData(BaseModel):
    id: str
    sections: Dict[str, str]

class ScoringDetails(BaseModel):
    keyword_score: float
    semantic_score: float
    matched_keywords: List[str]
    keyword_match_count: str

class RankedCandidate(BaseModel):
    application_id: str
    final_score: float
    details: ScoringDetails
    feedback: str = Field(default="", description="LLM-generated feedback for the candidate")

class RankingReport(BaseModel):
    shortlisted_candidates: List[RankedCandidate]
    rejected_candidates: List[RankedCandidate]

class FeedbackInformation(BaseModel):
    candidate_name: str
    company_name: str
    position: str