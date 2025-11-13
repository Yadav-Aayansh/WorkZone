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
- Generate ONE clear, direct question WITHOUT any AI prefixes or preambles
- DO NOT start with phrases like "AI:", "Assistant:", "Question:", or any meta-commentary
- Make it conversational and natural, as if speaking directly to the candidate
- Build on previous answers if relevant
- Avoid repeating topics already covered
- The question should help assess the candidate's fit for the role
- The question must be standalone - no explanations, no context, just the question itself

Return ONLY a JSON object:
{{
  "type": "technical|experience|behavioral|introduction",
  "question": "Your direct question here?",
  "focus_area": "specific_skill|experience|soft_skills|general"
}}"""

    messages = [
        {
            "role": "system",
            "content": "You are a concise technical recruiter conducting a conversational interview. Return only valid JSON with a clear, direct question. Never include AI prefixes, labels, or meta-commentary in the question text."
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
        
        # Remove AI prefixes and clean question
        question_text = question_data['question']
        
        # Remove common AI prefixes
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
        
        question_data['question'] = question_text.strip()
        
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


def is_poor_answer(answer: str, question: str = "") -> bool:
    answer_stripped = answer.strip()
    word_count = len(answer_stripped.split())
    
    if word_count < 3:
        return True
    
    # Use LLM for semantic understanding
    try:
        prompt = f"""Analyze if this interview answer is poor quality.

Question: {question}
Answer: {answer}

A poor answer includes:
- Refusing to answer (e.g., "I won't answer", "do what you want")
- Not knowing (e.g., "I don't know", "no idea", "not sure")
- Being evasive or dismissive (e.g., "whatever", "who cares")
- Off-topic or irrelevant responses
- Just filler words (e.g., "um", "uh", "hmm")
- Too vague with no substance
- One-word responses like "yes", "no", "maybe"

A good answer:
- Provides relevant information
- Shows knowledge or experience
- Addresses the question asked
- Has reasonable detail

Respond with ONLY "POOR" or "GOOD" - nothing else."""

        messages = [
            {
                "role": "system",
                "content": "You are an expert interviewer who can detect poor quality answers. Respond with only 'POOR' or 'GOOD'."
            },
            {"role": "user", "content": prompt}
        ]
        
        response = llm_client.call_llm(messages, temperature=0.1)
        response_clean = response.strip().upper()
        
        # Check if response contains POOR
        if "POOR" in response_clean:
            return True
        elif "GOOD" in response_clean:
            return False
        else:
            # Fallback to basic heuristics if LLM response is unclear
            return _fallback_poor_detection(answer, question)
            
    except Exception as e:
        print(f"LLM poor answer detection error: {e}")
        # Fallback to basic heuristics
        return _fallback_poor_detection(answer, question)


def _fallback_poor_detection(answer: str, question: str = "") -> bool:
    answer_lower = answer.lower().strip()
    word_count = len(answer.split())
    
    # Very short answers
    if word_count < 5:
        return True
    
    # Common explicit poor patterns
    poor_keywords = [
        "i don't know", "i dont know",
        "no idea", "not sure",
        "don't remember", "can't recall",
        "no experience", "not familiar",
        "not going to answer", "won't answer",
        "do what you want", "do what you can"
    ]
    
    for keyword in poor_keywords:
        if keyword in answer_lower:
            return True
    
    return False


def count_poor_answers(previous_qa: List[QuestionResponse]) -> int:
    poor_count = 0
    for qa in previous_qa:
        if is_poor_answer(qa.answer, qa.question):
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