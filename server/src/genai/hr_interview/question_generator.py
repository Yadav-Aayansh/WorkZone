import json
import re
from typing import List, Optional
from src.genai.llm_client import llm_client
from src.genai.hr_interview.text_cleaner import clean_text_for_speech
from src.genai.schemas.hr_interview import InterviewQuestion, QuestionResponse


async def generate_next_question(
    jd: str,
    resume: str,
    previous_qa: List[QuestionResponse],
    candidate_name: Optional[str] = None
) -> InterviewQuestion:
    
    # Build context from previous Q&A
    conversation_context = ""
    if previous_qa:
        conversation_context = "\n\nPrevious Questions & Answers:\n"
        for i, qa in enumerate(previous_qa, 1):
            conversation_context += f"Q{i}: {qa.question}\nA{i}: {qa.answer}\n\n"
    
    # Determine what type of question to ask next
    question_count = len(previous_qa)
    
    if question_count == 0:
        question_type_guidance = "Start with a warm introduction question asking about their background."
    elif question_count < 3:
        question_type_guidance = "Ask a technical question related to the job requirements and their resume."
    elif question_count < 5:
        question_type_guidance = "Ask about their experience with specific projects or technologies mentioned in their resume or previous answers."
    else:
        question_type_guidance = "Ask a behavioral or situational question to understand their soft skills and work style."
    
    prompt = f"""You are an expert technical recruiter conducting a dynamic interview. Generate ONE concise, conversational interview question.

Job Description:
{jd}

Resume:
{resume}
{conversation_context}

Guidance: {question_type_guidance}

Requirements:
- Generate ONE clear, single-sentence question
- Make it conversational and natural
- Build on previous answers if relevant
- Avoid repeating topics already covered
- The question should help assess the candidate's fit for the role

Return ONLY a JSON object:
{{
  "type": "technical|experience|behavioral|introduction",
  "question": "Your question here?",
  "focus_area": "specific_skill|experience|soft_skills|general"
}}"""

    messages = [
        {
            "role": "system",
            "content": "You are a concise technical recruiter conducting a conversational interview. Return only valid JSON with a clear, single-sentence question."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = llm_client.call_llm(messages, temperature=0.7)
        
        # Extract JSON from response
        start = response.find('{')
        end = response.rfind('}') + 1
        json_str = response[start:end]
        question_data = json.loads(json_str)
        
        # Clean question for speech
        question_data['question'] = clean_text_for_speech(question_data['question'])
        
        return InterviewQuestion(**question_data)
    
    except Exception as e:
        print(f"Question generation error: {e}")
        
        # Fallback questions based on count
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


def is_poor_answer(answer: str) -> bool:
    # Normalize answer for comparison
    answer_lower = answer.lower().strip()
    
    # Remove extra whitespace
    answer_lower = re.sub(r'\s+', ' ', answer_lower)
    
    # Patterns indicating "I don't know" responses
    poor_answer_patterns = [
        r'\bi don\'?t know\b',
        r'\bno idea\b',
        r'\bnot sure\b',
        r'\bdon\'?t remember\b',
        r'\bcan\'?t recall\b',
        r'\bno experience\b',
        r'\bnever (done|worked|used)\b',
        r'\bno clue\b',
        r'\bdon\'?t have (any |much )?experience\b',
        r'\bnot familiar\b',
        r'\bhaven\'?t (done|worked|used)\b',
        r'\bsorry,? (but )?i\b',
    ]
    
    # Check if answer matches any poor answer pattern
    for pattern in poor_answer_patterns:
        if re.search(pattern, answer_lower):
            return True
    
    # Check if answer is too short (less than 5 words) and doesn't seem substantial
    word_count = len(answer.split())
    if word_count < 5:
        # If very short, likely not a good answer unless it's a simple factual response
        return True
    
    return False


def count_poor_answers(previous_qa: List[QuestionResponse]) -> int:
    poor_count = 0
    for qa in previous_qa:
        if is_poor_answer(qa.answer):
            poor_count += 1
    return poor_count


async def should_continue_interview(
    previous_qa: List[QuestionResponse],
    min_questions: int = 5,
    max_questions: int = 10,
    max_poor_answers: int = 3
) -> bool:
    
    question_count = len(previous_qa)
    
    # Check for too many poor answers - END INTERVIEW EARLY
    poor_answer_count = count_poor_answers(previous_qa)
    if poor_answer_count >= max_poor_answers:
        return False  # Stop interview due to too many poor answers
    
    # Always continue if we haven't reached minimum (unless too many poor answers)
    if question_count < min_questions:
        return True
    
    # Stop if we've reached maximum
    if question_count >= max_questions:
        return False
    
    # Between min and max, continue
    return True