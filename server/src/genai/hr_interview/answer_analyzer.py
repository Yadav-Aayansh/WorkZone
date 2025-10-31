import json
from src.genai.llm_client import llm_client
from src.genai.schemas.hr_interview_schemas import AnswerAnalysis


def analyze_answer_quality(
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


# Testing the module

if __name__ == "__main__":
    print("Testing Answer Analyzer Module (Pydantic)")
    print("=" * 60)
    
    # Test cases with different quality answers
    test_cases = [
        {
            "question": "What is your experience with Python?",
            "answer": "I don't know much about Python.",
            "focus_area": "technical",
            "expected_range": (1, 3)
        },
        {
            "question": "Tell me about a challenging project.",
            "answer": "I worked on a project. It was difficult.",
            "focus_area": "experience",
            "expected_range": (3, 5)
        },
        {
            "question": "How do you handle tight deadlines?",
            "answer": "I prioritize tasks, break them into smaller chunks, communicate with my team about blockers, and focus on delivering the most critical features first. For example, in my last project, we had to deliver an API in 2 weeks, so I created a detailed timeline and delivered it on time.",
            "focus_area": "soft_skills",
            "expected_range": (7, 10)
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Question: {test['question']}")
        print(f"Answer: {test['answer']}")
        print(f"Focus: {test['focus_area']}")
        print("-" * 60)
        
        try:
            result = analyze_answer_quality(
                test['question'],
                test['answer'],
                test['focus_area']
            )
            
            print(f"Score: {result.score}/10")
            print(f"Strength: {result.strength}")
            print(f"Weakness: {result.weakness}")
            print(f"Type: {type(result).__name__}")
            
            # Validate score is in expected range
            if test['expected_range'][0] <= result.score <= test['expected_range'][1]:
                print("✓ Score in expected range")
            else:
                print(f"⚠ Score outside expected range {test['expected_range']}")
        
        except Exception as e:
            print(f"✗ Error: {e}")