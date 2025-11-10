import json
from src.genai.llm_client import llm_client
from src.genai.schemas.hr_interview_schemas import AnswerAnalysis


async def analyze_answer_quality(
    question: str,
    answer: str,
    focus_area: str
) -> AnswerAnalysis:
  
    prompt = f"""You are a STRICT interviewer evaluating answers. Rate this answer honestly from 1-10.

Question: {question}
Answer: {answer}
Focus: {focus_area}

SCORING GUIDELINES (BE STRICT):
- 1-2: No answer, "I don't know", irrelevant, or completely inadequate
- 3-4: Vague, lacks substance, minimal effort, superficial
- 5-6: Adequate but basic, missing key details, generic
- 7-8: Good answer with relevant details and examples
- 9-10: Excellent, comprehensive, specific examples, deep understanding

IMPORTANT: 
- If answer is "I don't know" or similar → score MUST be 1-2
- If answer lacks specifics or examples → score MUST be 4-5 maximum
- Be honest about weaknesses - don't sugarcoat poor answers

Return JSON:
{{"score": <1-10>, "strength": "what was good (or 'None' if bad answer)", "weakness": "what was missing or wrong"}}"""

    messages = [
        {
            "role": "system",
            "content": "You are a STRICT interviewer who rates answers honestly. Poor answers get low scores. Return only JSON."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = llm_client.call_llm(messages, temperature=0.2)
        start = response.find('{')
        end = response.rfind('}') + 1
        analysis_data = json.loads(response[start:end])
        
        # Validate and convert to Pydantic model
        analysis = AnswerAnalysis(**analysis_data)
        
        return analysis
    except Exception as e:
        print(f"Analysis error: {e}")
        return AnswerAnalysis(
            score=5,
            strength="Answer provided",
            weakness="Unable to evaluate properly"
        )
    