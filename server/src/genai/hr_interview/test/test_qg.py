import asyncio
import sys
import os

# Ensure src/ is available in import path
# ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# sys.path.append(ROOT_DIR)

from src.genai.hr_interview.question_generator import (
    generate_interview_questions,
    generate_followup_question,
)
from src.genai.schemas.hr_interview_schemas import InterviewQuestion


async def test_interview_question_generation():
    print("\n=== Test: Interview Question Generation ===")

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

    try:
        questions = await generate_interview_questions(
            jd=test_jd,
            resume=test_resume,
            num_questions=3,
        )

        print(f" Generated {len(questions)} questions")

        for i, q in enumerate(questions, start=1):
            assert isinstance(q, InterviewQuestion)
            print(f"{i}. [{q.type}] {q.question}  (Focus: {q.focus_area})")

    except Exception as e:
        print(f" Error: {e}")


async def test_followup_question():
    print("\n=== Test: Follow-up Question Generation ===")

    test_q = "Tell me about your Python experience."
    test_answer = (
        "I have worked with Python for 5 years, building applications with FastAPI "
        "and Flask, and doing machine learning with scikit-learn."
    )

    test_jd = "Python developer role requiring API development and ML experience."

    try:
        followup = await generate_followup_question(
            question=test_q,
            answer=test_answer,
            jd=test_jd
        )

        if followup:
            print(f"Follow-up question: {followup}")
        else:
            print("No follow-up generated (possibly short answer)")

    except Exception as e:
        print(f" Error: {e}")


async def main():
    print("Running Question Generator Tests")
    print("================================")
    await test_interview_question_generation()
    await test_followup_question()


if __name__ == "__main__":
    asyncio.run(main())
