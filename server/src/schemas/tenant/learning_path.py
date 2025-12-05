from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class GeneratePathRequest(BaseModel):
    career_goal: str
