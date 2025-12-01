from fastapi import APIRouter, Depends, HTTPException
from src.core.di import get_workspace_service, get_current_user
from src.services.platform import WorkspaceService
from uuid import UUID
from src.schemas.platform import LeaveTypesRequest, LeaveTypesResponse
from src.exceptions.platform import SettingNotFoundError, SettingAlreadyExistsError

workspace_router = APIRouter(prefix="/workspace", tags=["Client Workspace"])


@workspace_router.get("/leave-types", response_model=LeaveTypesResponse)
async def get_leave_types(
    service: WorkspaceService = Depends(get_workspace_service),
    current_user = Depends(get_current_user())
):
    try:
        client_id = current_user.get("sub")
        return await service.get_leave_types(client_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@workspace_router.post("/leave-types", status_code=201, response_model=LeaveTypesResponse)
async def create_leave_types(
    data: LeaveTypesRequest,
    service: WorkspaceService = Depends(get_workspace_service),
    current_user = Depends(get_current_user())
):
    try:
        client_id = current_user.get("sub")
        return await service.create_leave_types(client_id, data)
    except SettingAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@workspace_router.put("/leave-types", response_model=LeaveTypesResponse)
async def update_leave_types(
    data: LeaveTypesRequest,
    service: WorkspaceService = Depends(get_workspace_service),
    current_user = Depends(get_current_user())
):
    try:
        client_id = current_user.get("sub")
        return await service.update_leave_types(client_id, data)
    except SettingNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))