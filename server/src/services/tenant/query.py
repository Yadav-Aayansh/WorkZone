from uuid import UUID
from src.repository.tenant import QueryRepository, EmployeeRepository, RecruiterRepository
from src.exceptions.tenant import EmployeeNotFoundError, QueryNotFoundError, QueryClassificationError, QueryUnassignedError, NoRecruiterFoundError, RecruiterNotFoundError
from src.genai import classify_query
from src.genai.schemas import ClassificationResponse, UrgencyLevel, QueryCategory, Sentiment
from src.core.logger import logger
from src.schemas.tenant import QueryResponse

from typing import List

class QueryService:
    def __init__(self, query_repo: QueryRepository, employee_repo: EmployeeRepository, recruiter_repo: RecruiterRepository):
        self.query_repo = query_repo
        self.employee_repo = employee_repo
        self.recruiter_repo = recruiter_repo
        
    def _map_to_response(self, query) -> QueryResponse:
        """Helper to map DB model to Pydantic Response"""
        return QueryResponse(
            id=query.id,
            query_text=query.query_text,
            response_text=query.response_text,
            category=query.category,
            urgency=query.urgency,
            sentiment=query.sentiment,
            status=query.status,
            ai_summary=query.summary
        )

    async def create_query(self, user_id: UUID, query_text: str) -> QueryResponse:
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee profile not found for this user.")
        
        recruiter_id = await self.recruiter_repo.get_random_recruiter()
        if not recruiter_id:
            raise NoRecruiterFoundError("No recruiter was found when getting a random recruiter")
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
        
        return QueryResponse(
            id = new_query.id,
            query_text = new_query.query_text,
            category = new_query.category,
            urgency = new_query.urgency,
            status = new_query.status,
            sentiment = new_query.sentiment,
            ai_summary = new_query.summary
        )
            
    async def respond_to_query(self, query_id: UUID, response_text: str):
        query = await self.query_repo.get_query_by_id(query_id)
        
        if not query:
            raise QueryNotFoundError("Query ID not found.")

        if not query.recruiter_id:
            raise QueryUnassignedError("This query is unassigned. A recruiter must be assigned before responding.")

        updated_query = await self.query_repo.update_response(
            query_id=query_id, 
            response_text=response_text,
        )

        return {
            "message": "Response submitted successfully",
            "query_id": updated_query.id,
            "status": updated_query.status
        }
    
    async def get_queries_created_by_employee(self, user_id: UUID) -> List[QueryResponse]:
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee profile not found.")
        
        queries = await self.query_repo.get_queries_by_employee_id(employee.id)
        return [self._map_to_response(q) for q in queries]

    async def get_queries_assigned_to_recruiter(self, user_id: UUID) -> List[QueryResponse]:
        recruiter = await self.recruiter_repo.get_recruiter_by_user_id(user_id)
        if not recruiter:
            raise RecruiterNotFoundError("Recruiter profile not found.")
            
        queries = await self.query_repo.get_queries_by_recruiter_id(recruiter.id)
        return [self._map_to_response(q) for q in queries]