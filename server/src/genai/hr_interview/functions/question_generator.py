"""
Question Generator Module
Generates personalized interview questions based on JD and resume
"""

import json
from typing import List, Dict, Optional
from llm_client import call_llm
from text_cleaner import clean_text_for_speech


def generate_interview_questions(
    jd: str,
    resume: str,
    num_questions: int = 3
) -> List[Dict[str, str]]:
  
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
        response = call_llm(messages, temperature=0.7)
        
        # Extract JSON from response
        start = response.find('[')
        end = response.rfind(']') + 1
        json_str = response[start:end]
        questions = json.loads(json_str)
        
        # Clean questions for speech
        for q in questions:
            q['question'] = clean_text_for_speech(q['question'])
        
        return questions
    
    except Exception as e:
        print(f"Question generation error: {e}")
        # Fallback questions
        return [
            {
                "type": "introduction",
                "question": "Tell me about your background and experience.",
                "focus_area": "general"
            },
            {
                "type": "technical",
                "question": "What are your key technical skills for this role?",
                "focus_area": "skills"
            },
            {
                "type": "behavioral",
                "question": "Describe how you handle challenging situations at work.",
                "focus_area": "soft_skills"
            }
        ]


def generate_followup_question(
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
        followup = call_llm(messages, temperature=0.6)
        followup = clean_text_for_speech(followup)
        return followup.strip() if followup else None
    except:
        return None


# Testing the module

if __name__ == "__main__":
    print("Testing Question Generator Module")
    print("=" * 60)
    
    # Test data
    test_jd = """
    Software Engineer - Python
    Required: 3+ years Python, FastAPI, MongoDB
    Experience with AI/ML is a plus
    """
    
    test_resume = """
    John Doe - Software Developer
    5 years experience in Python development
    Built REST APIs using FastAPI and Flask
    Worked on ML projects using scikit-learn
    """
    
    print("\n1. Testing Interview Question Generation:")
    print("-" * 60)
    try:
        questions = generate_interview_questions(test_jd, test_resume, num_questions=3)
        print(f"✓ Generated {len(questions)} questions:\n")
        for i, q in enumerate(questions, 1):
            print(f"{i}. [{q['type']}] {q['question']}")
            print(f"   Focus: {q['focus_area']}\n")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n2. Testing Follow-up Question Generation:")
    print("-" * 60)
    test_q = "Tell me about your Python experience."
    test_answer = "I have worked with Python for 5 years, building web applications using FastAPI and Flask. I've also done data analysis with pandas and machine learning with scikit-learn."
    
    try:
        followup = generate_followup_question(test_q, test_answer, test_jd)
        if followup:
            print(f"✓ Follow-up: {followup}")
        else:
            print("✓ No follow-up generated (answer too short)")
    except Exception as e:
        print(f"✗ Error: {e}")
