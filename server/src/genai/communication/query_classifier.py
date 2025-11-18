import json
import asyncio
from src.genai.llm_client import llm_client
from src.genai.schemas.query_classifier import ClassificationResponse
from src.core.config import Config

_SYSTEM_PROMPT = """
You are an expert HR Triage Assistant. Your job is to analyze incoming employee queries and categorize them correctly for the backend system.

**Instructions:**
1. Analyze the User Query text below.
2. Determine the Category, Urgency, and Sentiment based on the definitions provided.
3. Write a 1-sentence summary and a brief reasoning.
4. **CRITICAL:** Output your answer as a SINGLE, VALID JSON object. Do not include any other text, explanations, or markdown formatting (like ```json).

**Valid Categories:**
- `payroll_finance`: Salary, taxes, reimbursements, bonuses.
- `it_support`: Hardware, software, VPN, account access, technical issues.
- `benefits_leave`: Health insurance, PTO, sick leave, maternity/paternity leave.
- `workplace_grievance`: Harassment, discrimination, interpersonal conflict, safety concerns. **(Treat as High/Critical Urgency)**.
- `policy_compliance`: Code of conduct, dress code, remote work policy questions.
- `feedback_suggestion`: Ideas for improvement, general feedback about the company.
- `general_inquiry`: Anything that strictly does not fit the above.

**Valid Urgency Levels:** `low`, `medium`, `high`, `critical`
**Valid Sentiments:** `positive`, `neutral`, `negative`

**Required JSON Structure:**
{{
  "category": "one of the valid categories above",
  "urgency": "one of the valid urgency levels",
  "sentiment": "one of the valid sentiments",
  "summary": "A concise 1-sentence summary",
  "reasoning": "Brief explanation of your choice"
}}

**User Query:**
"{query_text}"
"""

async def classify_query(query_text: str) -> ClassificationResponse:
    """
    Classifies an employee query into a structured format with category, urgency, and sentiment.
    """
    if not llm_client.text_model:
        print("Error: LLM client not initialized.")
        return None

    prompt = _SYSTEM_PROMPT.format(query_text=query_text)

    json_output = await llm_client.generate_text_async(
        prompt
    )


    if not json_output or "Error:" in json_output:
        print(f"Classification failed: {json_output}")
        return None

    try:
        data = json.loads(json_output)
        return ClassificationResponse(**data)
    except Exception as e:
        print(f"Failed to parse classification result: {e}")
        return None

# --- Test Block ---
async def main_test():
    if not Config.GOOGLE_API_KEY:
        print("!!! Skipping test: GOOGLE_API_KEY not found.")
        return

    print("--- Running Query Classifier Test ---\n")

    test_queries = [
        "My laptop screen keeps flickering and I can't connect to the VPN.",
        "I noticed my tax deduction was higher this month, can someone explain why?",
        "I am feeling very uncomfortable with how my manager speaks to me in private meetings.",
        "It would be great if we had a coffee machine on the second floor.",
        "How many sick days do I have left?"
    ]

    for q in test_queries:
        print(f"Query: '{q}'")
        result = await classify_query(q)
        if result:
            print(f" -> Category:  {result.category.value}")
            print(f" -> Urgency:   {result.urgency.value}")
            print(f" -> Sentiment: {result.sentiment.value}")
            print(f" -> Summary:   {result.summary}")
        else:
            print(" -> Failed to classify.")
        print("-" * 30)

if __name__ == "__main__":
    asyncio.run(main_test())