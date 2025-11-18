from typing import List
from pydantic import BaseModel, Field


class LearningPathRequest(BaseModel):
    """Input model for the learning path generator."""
    current_role: str = Field(..., description="The employee's current job title.")
    resume_text: str = Field(..., description="The full text of the employee's resume.")
    career_goal: str = Field(..., description="A simple text string of the employee's goal.")

class LearningResource(BaseModel):
    """A single, structured learning resource."""
    title: str
    url: str
    type: str = Field(..., description="e.g., 'Article', 'Video', 'Course', 'Documentation'")

class SkillArea(BaseModel):
    """A specific skill area in the learning path."""
    skill_name: str
    reason: str = Field(..., description="Why this skill is important for the goal.")
    resources: List[LearningResource]

class LearningPlanResponse(BaseModel):
    """The final, structured learning plan."""
    plan_title: str
    plan_summary: str
    skill_areas: List[SkillArea]