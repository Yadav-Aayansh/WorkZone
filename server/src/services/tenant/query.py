from uuid import UUID
from src.repository.tenant import QueryRepository, EmployeeRepository, RecruiterRepository
from src.exceptions.tenant import EmployeeNotFoundError, QueryNotFoundError, QueryClassificationError, QueryUnassignedError
from src.genai import classify_query
from src.genai.schemas import ClassificationResponse, UrgencyLevel, QueryCategory, Sentiment
from src.core.logger import logger

import random

class QueryService:
    def __init__(self, query_repo: QueryRepository, employee_repo: EmployeeRepository, recruiter_repo: RecruiterRepository):
        self.query_repo = query_repo
        self.employee_repo = employee_repo
        self.recruiter_repo = recruiter_repo
        

    async def create_query(self, user_id: UUID, query_text: str) -> dict:
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee profile not found for this user.")
        
        recruiter_id = await self.recruiter_repo.get_random_recruiter()
        if not recruiter_id:
            # Fallback if no recruiters exist in the system yet
            assigned_recruiter_id = None
        else:
            assigned_recruiter_id = recruiter_id

        try:
            classification = await classify_query(query_text)
            
            if not classification:
                raise QueryClassificationError("Empty response from AI")
                
        except Exception as e:
            logger.error(f"GenAI Query Classification Failed: {e}")
            # Fallback values so the user can still submit their ticket
            classification = ClassificationResponse(
                category=QueryCategory.GENERAL_INQUIRY,
                urgency=UrgencyLevel.MEDIUM,
                sentiment=Sentiment.NEUTRAL,
                summary=query_text[:100],
                reasoning="AI Classification failed; defaulted to general inquiry."
            )

        query_data = {
            "employee_id": employee.id,
            "query_text": query_text,
            "category": classification.category,
            "urgency": classification.urgency,
            "sentiment": classification.sentiment,
            "summary": classification.summary,
            "recruiter_id": assigned_recruiter_id
        }

        new_query = await self.query_repo.create_query(query_data)
        
        return {
            "id": new_query.id,
            "category": new_query.category,
            "urgency": new_query.urgency,
            "status": new_query.status,
            "ai_summary": new_query.summary
        }

    async def respond_to_query(self, query_id: UUID, response_text: str):
        query = await self.query_repo.get_query_by_id(query_id)
        
        if not query:
            raise QueryNotFoundError("Query ID not found.")

        if not query.recruiter_id:
            raise QueryUnassignedError("This query is unassigned. A recruiter must be assigned before responding.")

        updated_query = await self.query_repo.update_response(
            query_id=query_id, 
            response_text=response_text, 
            recruiter_id=query.recruiter_id
        )
            
        return updated_query