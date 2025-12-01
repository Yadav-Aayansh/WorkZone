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


async def is_clarifying_question(answer: str, question: str) -> bool:
    """
    Detect when candidate is genuinely seeking clarification about the question.
    
    Uses LLM to understand intent - looking for:
    - Expressing confusion about what's being asked
    - Requesting more details about the question
    - Asking for clarification or explanation
    
    NOT just vague incomplete answers or "I don't know" responses.
    """
    answer_lower = answer.lower().strip()
    word_count = len(answer.split())
    
    # Explicit rejection: "I don't know" type answers are NOT clarification requests
    not_clarification_phrases = [
        "i don't know", "i dont know", "dont know", "don't know",
        "no idea", "not sure", "i'm not sure", "im not sure"
    ]
    
    for phrase in not_clarification_phrases:
        if phrase in answer_lower:
            return False  # Definitely NOT a clarification
    
    # Must be reasonably short (clarification requests are usually brief)
    if word_count > 20:
        return False
    
    # Quick pattern check for obvious clarifications
    obvious_clarification_phrases = [
        "didn't get", "don't get", "didnt get", "dont get",
        "didn't understand", "don't understand",
        "can you clarify", "could you clarify",
        "can you explain", "could you explain",
        "what do you mean", "what does that mean",
        "can you elaborate", "could you elaborate",
        "please clarify", "please explain",
        "which one", "which service", "which project",
        "i'm confused", "im confused", "confused about"
    ]
    
    for phrase in obvious_clarification_phrases:
        if phrase in answer_lower:
            return True
    
    # Use LLM for semantic understanding of intent
    try:
        prompt = f"""Is the candidate asking for CLARIFICATION about the question, or just giving an incomplete/poor answer?

Question: {question}
Candidate Response: {answer}

CLARIFICATION (actively seeking to understand the question):
- "I didn't get it, can you clarify?"
- "Which services are you referring to?"
- "Could you explain what you mean by scalability?"
- "I'm confused, can you elaborate?"

NOT CLARIFICATION (poor/incomplete answers):
- "I don't know"
- "I'm not sure about that"
- "Maybe something with databases"
- "I think it depends"
- "No idea"
- Random gibberish like "lk d lsm lsm"

CRITICAL: "I don't know" is NEVER a clarification request - it's a poor answer.
CRITICAL: Gibberish or random text is NEVER a clarification request - it's a poor answer.

Respond ONLY with "CLARIFICATION" or "NOT_CLARIFICATION"."""

        messages = [
            {
                "role": "system",
                "content": "Determine if candidate is ASKING FOR CLARIFICATION (wants to understand the question better) vs giving incomplete/poor answer. 'I don't know' and gibberish are NOT clarification. Respond only 'CLARIFICATION' or 'NOT_CLARIFICATION'."
            },
            {"role": "user", "content": prompt}
        ]
        
        response = llm_client.call_llm(messages, temperature=0.0)
        response_clean = response.strip().upper()
        
        return "CLARIFICATION" in response_clean and "NOT_CLARIFICATION" not in response_clean
            
    except Exception as e:
        print(f"Clarifying question detection error: {e}")
        # Fallback: check for obvious phrases
        return any(phrase in answer_lower for phrase in obvious_clarification_phrases)


async def generate_clarification(question: str, candidate_answer: str) -> str:
    """
    Generate a clarification response when candidate asks a clarifying question
    """
    try:
        prompt = f"""The candidate asked for clarification about your interview question. Provide a brief, helpful clarification.

Your Original Question: {question}
Candidate's Clarifying Question: {candidate_answer}

Provide a clear, concise clarification (2-3 sentences max) that helps the candidate understand what you're asking for. Be specific and helpful.

Respond with ONLY the clarification text - no preamble, no labels."""

        messages = [
            {
                "role": "system",
                "content": "You are a helpful interviewer providing clarifications. Be clear and concise."
            },
            {"role": "user", "content": prompt}
        ]
        
        response = llm_client.call_llm(messages, temperature=0.5)
        
        # Clean up the response
        clarification = response.strip()
        
        # Remove common prefixes if present
        prefixes_to_remove = [
            "Clarification:", "Sure,", "Of course,", "Let me clarify:",
            "I'm asking about", "I mean", "Specifically,"
        ]
        
        for prefix in prefixes_to_remove:
            if clarification.startswith(prefix):
                clarification = clarification[len(prefix):].strip()
        
        return clarification
        
    except Exception as e:
        print(f"Clarification generation error: {e}")
        return "I'm asking about your specific experience and approach with the technologies mentioned. Please share relevant details from your work."


async def is_poor_answer(answer: str, question: str = "") -> bool:
    """
    Detect poor quality answers using LLM semantic understanding.
    
    A poor answer is:
    1. Explicit refusal ("I won't answer", "do what you want")
    2. Admits not knowing ("I don't know", "no idea")
    3. Completely off-topic/irrelevant to the question
    4. Just filler words or very short
    5. Gibberish or random text
    
    A good answer (even if brief):
    - Relevant to the question asked
    - Shows attempt to address the question
    - On-topic even if short (2-3 lines fine)
    """
    # Very short answers
    answer_stripped = answer.strip()
    word_count = len(answer_stripped.split())
    
    if word_count < 3:
        return True
    
    # First do a quick check with fallback detection
    if _fallback_poor_detection(answer, question):
        return True
    
    # Use LLM to check relevance and quality
    try:
        prompt = f"""Evaluate if this interview answer is POOR quality.

Question: {question}
Answer: {answer}

A POOR answer is:
1. Refuses to answer: "I won't answer", "do what you want", "whatever"
2. Admits not knowing: "I don't know", "no idea", "not sure", "can't recall"
3. COMPLETELY OFF-TOPIC or IRRELEVANT to the question asked
4. Just filler: "um", "uh", "hmm"
5. Single word: "yes", "no", "maybe"
6. Gibberish or random text: "lk d lsm lsm", "asdfgh", random characters

A GOOD answer (even if short):
1. Relevant to the question (addresses what was asked)
2. On-topic even if brief (2-3 lines is fine)
3. Shows knowledge or experience related to the question
4. Attempts to answer the question asked

CRITICAL: Check if answer is RELEVANT to the question topic.
- If question asks about "technical challenges in microservices" and answer talks about unrelated things → POOR
- If question asks about "design choices" and answer introduces themselves → POOR (off-topic)
- If answer is short but addresses the question → GOOD
- If answer is gibberish or random characters → POOR

Respond ONLY with "POOR" or "GOOD"."""

        messages = [
            {
                "role": "system",
                "content": "You are evaluating interview answers. Mark as POOR if: refuses, doesn't know, completely off-topic/irrelevant, or gibberish. Short but relevant answers are GOOD. Respond only 'POOR' or 'GOOD'."
            },
            {"role": "user", "content": prompt}
        ]
        
        response = llm_client.call_llm(messages, temperature=0.0)
        response_clean = response.strip().upper()
        
        if "POOR" in response_clean:
            return True
        elif "GOOD" in response_clean:
            return False
        else:
            return _fallback_poor_detection(answer, question)
            
    except Exception as e:
        print(f"LLM poor answer detection error: {e}")
        return _fallback_poor_detection(answer, question)


def _fallback_poor_detection(answer: str, question: str = "") -> bool:
    """More lenient fallback detection - only catches truly poor responses"""
    answer_lower = answer.lower().strip()
    word_count = len(answer.split())
    
    # Very short answers (more lenient - only < 3 words)
    if word_count < 3:
        return True
    
    # Common explicit poor patterns (explicit refusals and "I don't know")
    poor_keywords = [
        "i don't know", "i dont know",
        "no idea", "not sure",
        "don't remember", "can't recall",
        "no experience with", "not familiar with",
        "not going to answer", "won't answer",
        "do what you want", "do what you can",
        "whatever", "who cares"
    ]
    
    for keyword in poor_keywords:
        if keyword in answer_lower:
            return True
    
    # Check for gibberish patterns (repeated characters, no vowels, etc.)
    # Remove spaces and check if it looks like gibberish
    answer_no_spaces = answer_lower.replace(" ", "")
    if len(answer_no_spaces) > 5:
        vowels = sum(1 for c in answer_no_spaces if c in 'aeiou')
        vowel_ratio = vowels / len(answer_no_spaces)
        # If very few vowels, likely gibberish
        if vowel_ratio < 0.15:
            return True
    
    # If answer has 3+ words and doesn't match poor patterns, it's probably okay
    return False


async def count_poor_answers(previous_qa: List[QuestionResponse]) -> int:
    poor_count = 0
    for qa in previous_qa:
        if await is_poor_answer(qa.answer, qa.question):
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
    poor_answer_count = await count_poor_answers(previous_qa)
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