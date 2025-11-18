import asyncio
import json
from src.genai.schemas.personalized_learning import LearningPathRequest, LearningPlanResponse
from src.genai.utils.text_extractor import extract_text_from_file
from src.genai.utils.download_blob import download_blob
from src.genai.llm_client import llm_client


_SYSTEM_PROMPT = """
You are an expert career coach and senior technical recruiter.
Your task is to create a personalized, actionable learning plan based on a user's current role, their resume, and their stated career goal.

You will perform a two-step process in a single turn:
1.  **Analyze:** Read the user's role, resume, and goal. Identify the 3-5 most critical skill gaps.
2.  **Recommend:** For EACH of those 3-5 skill gaps, **recommend 1-2 high-quality, free learning resources.** You must use your internal knowledge to suggest specific, well-known resources (e.g., official documentation, specific free courses on platforms like freeCodeCamp, or famous books/articles).

Based on your analysis, generate the learning plan.

**User Input:**
- Current Role: {request.current_role}
- Career Goal: {request.career_goal}
- Resume Text:
---
{request.resume_text}
---

**Instructions for Output:**
- The final output MUST be a single, valid JSON object.
- Do not include any text, explanation, or markdown backticks before or after the JSON.
- The JSON object must match this Pydantic schema:
  {{
    "plan_title": "string (e.g., 'Your Path from [Role] to [Goal]')",
    "plan_summary": "string (A 1-2 sentence summary of the plan, starting with 'This plan focuses on...')",
    "skill_areas": [
      {{
        "skill_name": "string (e.g., 'System Design')",
        "reason": "string (Why this skill is needed for their goal, e.g., 'To move from component-level to system-level thinking.')",
        "resources": [
          {{
            "title": "string (The title of the recommended resource, e.g., 'Grokking the System Design Interview')",
            "url": "string (A URL to the resource. If it's a book, a link to a summary or Amazon is fine. If it's documentation, link to the main page.)",
            "type": "string ('Article', 'Video', 'Documentation', 'Book', or 'Free Course')"
          }}
        ]
      }}
    ]
  }}
"""


async def generate_learning_plan(resume_blob_name: str, current_role: str, career_goal: str) -> LearningPlanResponse:
    
    raw_text = extract_text_from_file(download_blob(blob_name=resume_blob_name))

    learning_path_request = LearningPathRequest(
        current_role=current_role,
        resume_text=raw_text,
        career_goal=career_goal
    )

    return await _call_gemini_api(learning_path_request=learning_path_request)

async def _call_gemini_api(learning_path_request: LearningPathRequest) -> LearningPlanResponse:
    """
    Generates a personalized learning plan using a single,
    search-enabled LLM call.
    """
    prompt = _SYSTEM_PROMPT.format(request=learning_path_request)
    
    json_output = await llm_client.generate_text_async(prompt)
    cleaned_json = json_output.strip().replace("```json", "").replace("```", "").strip()

    if "Error:" in json_output:
        # Handle LLM error
        return LearningPlanResponse(
            plan_title="Error",
            plan_summary=f"Could not generate plan: {json_output}",
            skill_areas=[]
        )

    try:
        # Parse the JSON string from the LLM into our Pydantic models
        data = json.loads(cleaned_json)
        return LearningPlanResponse(**data)
    except Exception as e:
        print(f"Failed to parse LLM JSON output: {e}")
        return LearningPlanResponse(
            plan_title="Error",
            plan_summary=f"Could not parse the generated plan: {e}",
            skill_areas=[]
        )
    
if __name__ == "__main__":


    learning_path = asyncio.run(generate_learning_plan(resume_blob_name="Shreyas_Jani_Resume_Sept2025.pdf", current_role="Python Developer", career_goal="ML Research Scientist"))

    print(learning_path.model_dump_json(indent=2))