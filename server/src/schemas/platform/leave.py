from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any

class LeaveTypeConfig(BaseModel):
    days: int = Field(gt=0, le=365)
    carry_forward: bool = Field(default=False)
    max_carry: Optional[int] = Field(None, gt=0, le=365)
    encashable: bool = Field(default=False)

class LeaveTypesResponse(BaseModel):
    casual: Optional[Dict[str, Any]] = None
    sick: Optional[Dict[str, Any]] = None
    earned: Optional[Dict[str, Any]] = None
    maternity: Optional[Dict[str, Any]] = None
    paternity: Optional[Dict[str, Any]] = None

class LeaveTypesRequest(BaseModel):
    casual: Optional[LeaveTypeConfig] = None
    sick: Optional[LeaveTypeConfig] = None
    earned: Optional[LeaveTypeConfig] = None
    maternity: Optional[LeaveTypeConfig] = None
    paternity: Optional[LeaveTypeConfig] = None