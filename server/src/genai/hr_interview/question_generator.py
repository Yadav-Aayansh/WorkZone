import json
import re
from typing import List, Optional, Tuple, Dict
from src.genai.llm_client import llm_client
from src.genai.hr_interview.text_cleaner import clean_text_for_speech
from src.genai.schemas.hr_interview import InterviewQuestion, QuestionResponse


async def process_answer_single_call(
    current_answer: str,
    current_question: str,
    jd: str,
    resume: str,
    previous_qa: List[QuestionResponse],
    candidate_name: Optional[str] = None,
    min_questions: int = 5,
    max_questions: int = 10,
    max_poor_answers: int = 3
) -> Dict:
   
    # Build context from previous Q&A
    conversation_context = ""
    if previous_qa:
        conversation_context = "\n\nPrevious Questions & Answers:\n"
        for i, qa in enumerate(previous_qa, 1):
            conversation_context += f"Q{i}: {qa.question}\nA{i}: {qa.answer}\n\n"
    
    # Determine question type guidance
    question_count = len(previous_qa)
    
    if question_count == 0:
        question_type_guidance = "Start with a warm introduction question asking about their background."
    elif question_count < 3:
        question_type_guidance = "Ask a technical question related to the job requirements and their resume."
    elif question_count < 5:
        question_type_guidance = "Ask about their experience with specific projects or technologies mentioned in their resume or previous answers."
    else:
        question_type_guidance = "Ask a behavioral or situational question to understand their soft skills and work style."
    
    prompt = f"""You are an expert HR interviewer. Analyze the candidate's response and make ALL necessary decisions in ONE response.

CONTEXT:
Job Description: {jd}
Resume: {resume}
{conversation_context}

CURRENT INTERACTION:
Interviewer Question: {current_question}
Candidate Answer: {current_answer}

INTERVIEW RULES:
- Minimum questions: {min_questions}
- Maximum questions: {max_questions}
- Maximum poor answers before ending: {max_poor_answers}
- Current question count: {question_count + 1}

YOUR TASK - Complete ALL steps below:

STEP 1: Check if candidate is asking for CLARIFICATION
- CLARIFICATION = actively seeking to understand the question (e.g., "Which services?", "Can you clarify?")
- NOT CLARIFICATION = poor/incomplete answers (e.g., "I don't know", gibberish, off-topic)
- CRITICAL: "I don't know" is NOT a clarification request

STEP 2: Evaluate answer quality (only if NOT clarification)
Evaluate the CURRENT answer:
- POOR = refuses, doesn't know, completely off-topic, gibberish, very short (<3 words)
- GOOD = relevant to question, attempts to answer, on-topic

Also evaluate ALL PREVIOUS answers from the conversation above:
- Return evaluation for each previous answer in order

STEP 3: Count poor answers and decide continuation
- Total poor count = poor previous answers + (1 if current is poor else 0)
- Should STOP if: poor_count >= {max_poor_answers} OR question_count >= {max_questions}
- Should CONTINUE if: poor_count < {max_poor_answers} AND question_count < {max_questions}
- If question_count < {min_questions}, ALWAYS continue (unless too many poor answers)

STEP 4: Generate next question (ONLY if should continue and NOT clarification)
- Question type guidance: {question_type_guidance}
- Generate ONE clear, direct question
- Build on previous answers
- Avoid repeating topics
- NO AI prefixes (no "AI:", "Assistant:", "Question:")

STEP 5: Generate clarification text (ONLY if IS clarification)
- Provide brief, helpful clarification (2-3 sentences)
- Help candidate understand what you're asking

Return ONLY this JSON structure:
{{
  "is_clarification": true/false,
  "clarification_text": "clarification response here" or null,
  
  "current_answer_quality": "POOR" or "GOOD" or null,
  "previous_answer_evaluations": ["GOOD", "POOR", ...] or [],
  "poor_answer_count": number,
  
  "should_continue": true/false or null,
  "completion_reason": "poor_answers" or "max_questions" or "min_questions_reached" or null,
  
  "next_question": {{
    "type": "technical|experience|behavioral|introduction",
    "question": "your question here",
    "focus_area": "specific_skill|experience|soft_skills|general"
  }} or null
}}

LOGIC RULES:
- If is_clarification=true: only fill clarification_text, set everything else to null
- If is_clarification=false AND should_continue=true: fill next_question
- If is_clarification=false AND should_continue=false: fill completion_reason, set next_question to null
- Always evaluate answer quality and count poor answers (unless clarification)

EXAMPLES:

Example 1 - Clarification needed:
Input: "Which services are you referring to?"
Output: {{"is_clarification": true, "clarification_text": "I'm asking about the cloud services you mentioned in your resume, specifically AWS, Azure, or GCP.", "current_answer_quality": null, "previous_answer_evaluations": [], "poor_answer_count": 0, "should_continue": null, "completion_reason": null, "next_question": null}}

Example 2 - Poor answer, should end:
Input: "I don't know" (and this is 3rd poor answer)
Output: {{"is_clarification": false, "clarification_text": null, "current_answer_quality": "POOR", "previous_answer_evaluations": ["GOOD", "POOR", "POOR"], "poor_answer_count": 3, "should_continue": false, "completion_reason": "poor_answers", "next_question": null}}

Example 3 - Good answer, continue:
Input: "I have worked with React and Node.js for 3 years..."
Output: {{"is_clarification": false, "clarification_text": null, "current_answer_quality": "GOOD", "previous_answer_evaluations": ["GOOD"], "poor_answer_count": 0, "should_continue": true, "completion_reason": null, "next_question": {{"type": "technical", "question": "Can you describe a challenging project where you used React?", "focus_area": "experience"}}}}"""

    messages = [
        {
            "role": "system",
            "content": "You are an expert HR interviewer who makes multiple decisions efficiently. Analyze the situation and return a complete JSON response with all decisions. Follow the logic rules strictly."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = llm_client.call_llm(messages, temperature=0.3)
        
        # Extract JSON from response
        start = response.find('{')
        end = response.rfind('}') + 1
        json_str = response[start:end]
        result = json.loads(json_str)
        
        # Clean up next question if present
        if result.get('next_question') and result['next_question']:
            question_text = result['next_question']['question']
            
            # Remove AI prefixes
            ai_prefixes = [
                r'^AI:\s*',
                r'^Assistant:\s*',
                r'^Question:\s*',
                r'^Q:\s*',
                r'^Interview Question:\s*',
                r'^\[\w+\]:\s*',
            ]
            
            for prefix in ai_prefixes:
                question_text = re.sub(prefix, '', question_text, flags=re.IGNORECASE)
            
            result['next_question']['question'] = clean_text_for_speech(question_text.strip())
        
        # Clean up clarification text if present
        if result.get('clarification_text'):
            clarification = result['clarification_text'].strip()
            
            prefixes_to_remove = [
                "Clarification:", "Sure,", "Of course,", "Let me clarify:",
                "I'm asking about", "I mean", "Specifically,"
            ]
            
            for prefix in prefixes_to_remove:
                if clarification.startswith(prefix):
                    clarification = clarification[len(prefix):].strip()
            
            result['clarification_text'] = clarification
        
        return result
        
    except Exception as e:
        print(f"Single call processing error: {e}")
        # Fallback to safe defaults
        return {
            "is_clarification": False,
            "clarification_text": None,
            "current_answer_quality": "GOOD",
            "previous_answer_evaluations": ["GOOD"] * len(previous_qa),
            "poor_answer_count": 0,
            "should_continue": question_count < max_questions,
            "completion_reason": None,
            "next_question": {
                "type": "experience",
                "question": "Can you tell me more about your experience?",
                "focus_area": "experience"
            } if question_count < max_questions else None
        }


#kept for backward compatibility (use fallback logic)
async def generate_next_question(
    jd: str,
    resume: str,
    previous_qa: List[QuestionResponse],
    candidate_name: Optional[str] = None
) -> InterviewQuestion:
    question_count = len(previous_qa)
    
    fallback_questions = [
        InterviewQuestion(
            type="introduction",
            question="Tell me about your background and experience.",
            focus_area="general"
        ),
        InterviewQuestion(
            type="technical",
            question="What are your key technical skills for this role?",
            focus_area="skills"
        ),
        InterviewQuestion(
            type="experience",
            question="Can you describe a challenging project you've worked on?",
            focus_area="experience"
        ),
        InterviewQuestion(
            type="behavioral",
            question="How do you handle difficult situations at work?",
            focus_area="soft_skills"
        ),
    ]
    
    return fallback_questions[min(question_count, len(fallback_questions) - 1)]


async def is_clarifying_question(answer: str, question: str) -> bool:

    answer_lower = answer.lower().strip()
    
    obvious_clarification_phrases = [
        "didn't get", "don't get", "can you clarify", "could you clarify",
        "can you explain", "could you explain", "what do you mean",
        "can you elaborate", "which one", "which service"
    ]
    
    return any(phrase in answer_lower for phrase in obvious_clarification_phrases)


async def generate_clarification(question: str, candidate_answer: str) -> str:
    return "I'm asking about your specific experience and approach with the technologies mentioned. Please share relevant details from your work."


def _fallback_poor_detection(answer: str, question: str = "") -> bool:
    answer_lower = answer.lower().strip()
    word_count = len(answer.split())
    
    if word_count < 3:
        return True
    
    poor_keywords = [
        "i don't know", "i dont know", "no idea", "not sure"
    ]
    
    return any(keyword in answer_lower for keyword in poor_keywords)


async def count_poor_answers(previous_qa: List[QuestionResponse]) -> int:
    return sum(1 for qa in previous_qa if _fallback_poor_detection(qa.answer, qa.question))


async def should_continue_interview_with_count(
    previous_qa: List[QuestionResponse],
    min_questions: int = 5,
    max_questions: int = 10,
    max_poor_answers: int = 3
) -> Tuple[bool, int]:
    question_count = len(previous_qa)
    poor_count = await count_poor_answers(previous_qa)
    
    if poor_count >= max_poor_answers:
        return False, poor_count
    if question_count < min_questions:
        return True, poor_count
    if question_count >= max_questions:
        return False, poor_count
    
    return True, poor_count


async def should_continue_interview(
    previous_qa: List[QuestionResponse],
    min_questions: int = 5,
    max_questions: int = 10,
    max_poor_answers: int = 3
) -> bool:
    should_continue, _ = await should_continue_interview_with_count(
        previous_qa, min_questions, max_questions, max_poor_answers
    )
    return should_continue