from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import Any, Dict, List

from src.services.tenant.query import QueryService
from src.core.di import get_query_service, get_current_user
from src.models.tenant import Role
from src.exceptions.tenant import (
    EmployeeNotFoundError,
    QueryNotFoundError,
    QueryUnassignedError,
    ValidationError,
    RecruiterNotFoundError
)
from src.schemas.tenant import CreateQueryRequest, QueryResponse, RespondQueryRequest, QueryResolutionResponse

query_router = APIRouter(prefix="/queries", tags=["Tenant Queries"])

@query_router.post("", response_model=QueryResponse, status_code=status.HTTP_201_CREATED)
async def create_query(
    request: CreateQueryRequest,
    service: QueryService = Depends(get_query_service),
    current_user: Dict[str, Any] = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    user_id = UUID(current_user.get("sub"))
    try:
        result = await service.create_query(user_id, request.query_text)
        return result
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")
    

@query_router.get("/my-queries", response_model=List[QueryResponse])
async def get_my_queries(
    service: QueryService = Depends(get_query_service),
    current_user: Dict[str, Any] = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    """
    For Employees: Get queries they created.
    """
    user_id = UUID(current_user.get("sub"))
    try:
        return await service.get_queries_created_by_employee(user_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@query_router.get("/assigned-queries", response_model=List[QueryResponse])
async def get_assigned_queries(
    service: QueryService = Depends(get_query_service),
    current_user: Dict[str, Any] = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    """
    For Recruiters: Get queries assigned to them.
    """
    user_id = UUID(current_user.get("sub"))
    try:
        return await service.get_queries_assigned_to_recruiter(user_id)
    except RecruiterNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@query_router.post("/{query_id}/response", response_model=QueryResolutionResponse, status_code=status.HTTP_200_OK)
async def respond_to_query(
    query_id: UUID,
    request: RespondQueryRequest,
    service: QueryService = Depends(get_query_service),
    # Only Recruiters should be able to respond
    current_user: Dict[str, Any] = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        return await service.respond_to_query(query_id, request.response_text)
    
    except QueryNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    except QueryUnassignedError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))