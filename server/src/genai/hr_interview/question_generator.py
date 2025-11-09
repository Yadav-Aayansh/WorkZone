import json
from typing import List, Optional
from src.genai.llm_client import llm_client
from src.genai.hr_interview.text_cleaner import clean_text_for_speech
from src.genai.schemas.hr_interview_schemas import InterviewQuestion


async def generate_interview_questions(
    jd: str,
    resume: str,
    num_questions: int = 3
) -> List[InterviewQuestion]:
    
    prompt = f"""You are an expert technical recruiter. Generate {num_questions} concise, direct interview questions.

Job Description:
{jd}

Resume:
{resume}

Requirements:
- Each question should be ONE clear sentence
- Mix technical, experience-based, and behavioral questions
- Questions should be conversational and natural
- No explanations, just the questions

Return ONLY a JSON array:
[
  {{"type": "technical", "question": "What is your experience with [technology from JD]?", "focus_area": "skills"}},
  {{"type": "experience", "question": "Tell me about [project from resume].", "focus_area": "experience"}},
  {{"type": "behavioral", "question": "How do you handle [situation]?", "focus_area": "soft_skills"}}
]"""

    messages = [
        {
            "role": "system",
            "content": "You are a concise technical recruiter. Return only valid JSON with clear, single-sentence questions."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = llm_client.call_llm(messages, temperature=0.7)
        
        # Extract JSON from response
        start = response.find('[')
        end = response.rfind(']') + 1
        json_str = response[start:end]
        questions_data = json.loads(json_str)
        
        # Convert to Pydantic models and clean for speech
        questions = []
        for q_data in questions_data:
            q_data['question'] = clean_text_for_speech(q_data['question'])
            questions.append(InterviewQuestion(**q_data))
        
        return questions
    
    except Exception as e:
        print(f"Question generation error: {e}")
        # Fallback questions
        return [
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
                type="behavioral",
                question="Describe how you handle challenging situations at work.",
                focus_area="soft_skills"
            )
        ]


async def generate_followup_question(
    question: str,
    answer: str,
    jd: str
) -> Optional[str]:
   
    # Skip follow-up for very short answers
    if len(answer.split()) < 10:
        return None
    
    prompt = f"""Generate ONE short follow-up question based on:

Question: {question}
Answer: {answer}

The follow-up should:
- Be ONE clear sentence
- Probe deeper into their answer
- Be conversational

Return ONLY the question, nothing else."""

    messages = [
        {
            "role": "system",
            "content": "You are an interviewer asking brief follow-up questions."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        followup = llm_client.call_llm(messages, temperature=0.6)
        followup = clean_text_for_speech(followup)
        return followup.strip() if followup else None
    except:
        return None
