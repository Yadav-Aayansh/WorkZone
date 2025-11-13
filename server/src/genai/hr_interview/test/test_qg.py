import asyncio
import sys
import os

from src.genai.hr_interview.question_generator import (
    generate_next_question,
    should_continue_interview,
)
from src.genai.schemas.hr_interview import (
    InterviewQuestion,
    QuestionResponse
)


async def test_first_question_generation():
    """Test generating the first question with no history"""
    print("\n=== Test: First Question Generation (No History) ===")

    test_jd = """
# Software Engineer - Python

## Required Skills
- 3+ years Python experience
- FastAPI framework expertise
- MongoDB database experience
- Experience with AI/ML is a plus

## Responsibilities
- Build scalable REST APIs
- Design database schemas
- Collaborate with ML team
"""

    test_resume = """
# John Doe - Software Developer

## Experience
- 5 years experience in Python development
- Built REST APIs using FastAPI and Flask
- Worked on ML projects using scikit-learn
- Strong background in MongoDB and PostgreSQL

## Education
- BS Computer Science
"""

    try:
        # Generate first question with empty history
        question = await generate_next_question(
            jd=test_jd,
            resume=test_resume,
            previous_qa=[],
            candidate_name="John Doe"
        )

        assert isinstance(question, InterviewQuestion)
        print(f"✓ Generated first question")
        print(f"  Type: {question.type}")
        print(f"  Focus: {question.focus_area}")
        print(f"  Question: {question.question}")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def test_dynamic_question_generation():
    """Test generating questions based on conversation history"""
    print("\n=== Test: Dynamic Question Generation (With History) ===")

    test_jd = """
# Python Developer

## Requirements
- Python 3+ years
- API development with FastAPI
- MongoDB experience
- Machine learning background
"""

    test_resume = """
# Jane Smith - Backend Engineer

## Experience
- 4 years Python development
- Built microservices with FastAPI
- Worked with MongoDB and Redis
- Applied ML models in production
"""

    # Simulate conversation history
    previous_qa = [
        QuestionResponse(
            question_index=0,
            question="Tell me about your background and experience.",
            answer="I'm a backend engineer with 4 years of Python experience. I've built microservices using FastAPI and worked extensively with MongoDB. I've also deployed ML models in production.",
            timestamp="2025-01-01T10:00:00"
        )
    ]

    try:
        # Generate second question based on first answer
        question = await generate_next_question(
            jd=test_jd,
            resume=test_resume,
            previous_qa=previous_qa,
            candidate_name="Jane Smith"
        )

        assert isinstance(question, InterviewQuestion)
        print(f"✓ Generated second question (based on previous answer)")
        print(f"  Type: {question.type}")
        print(f"  Focus: {question.focus_area}")
        print(f"  Question: {question.question}")
        print(f"  → Should build on the fact they mentioned microservices/ML")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def test_progressive_question_types():
    """Test that question types evolve appropriately"""
    print("\n=== Test: Progressive Question Type Evolution ===")

    test_jd = "Python Developer with FastAPI and MongoDB"
    test_resume = "John - 5 years Python, backend specialist"

    # Simulate multiple questions
    previous_qa_stages = [
        [],  # First question
        [QuestionResponse(
            question_index=0,
            question="Q1",
            answer="A1 about background",
            timestamp="2025-01-01T10:00:00"
        )],  # Second
        [
            QuestionResponse(
                question_index=0,
                question="Q1",
                answer="A1",
                timestamp="2025-01-01T10:00:00"
            ),
            QuestionResponse(
                question_index=1,
                question="Q2",
                answer="A2 about Python",
                timestamp="2025-01-01T10:01:00"
            )
        ],  # Third
        [
            QuestionResponse(
                question_index=0,
                question="Q1",
                answer="A1",
                timestamp="2025-01-01T10:00:00"
            ),
            QuestionResponse(
                question_index=1,
                question="Q2",
                answer="A2",
                timestamp="2025-01-01T10:01:00"
            ),
            QuestionResponse(
                question_index=2,
                question="Q3",
                answer="A3 about projects",
                timestamp="2025-01-01T10:02:00"
            ),
            QuestionResponse(
                question_index=3,
                question="Q4",
                answer="A4",
                timestamp="2025-01-01T10:03:00"
            ),
        ]  # Fifth
    ]

    for i, qa_history in enumerate(previous_qa_stages):
        try:
            question = await generate_next_question(
                jd=test_jd,
                resume=test_resume,
                previous_qa=qa_history,
                candidate_name="John"
            )

            print(f"\n  Question #{i+1} (after {len(qa_history)} answers):")
            print(f"    Type: {question.type}")
            print(f"    Focus: {question.focus_area}")
            print(f"    Text: {question.question[:60]}...")

        except Exception as e:
            print(f"  ✗ Error at stage {i+1}: {e}")


async def test_should_continue():
    """Test interview continuation logic including poor answers"""
    print("\n=== Test: Should Continue Interview Logic ===")

    test_cases = [
        ([], "Should continue (0 questions, min is 5)"),
        (
            [QuestionResponse(
                question_index=i,
                question=f"Q{i}",
                answer=f"A{i}",
                timestamp="2025-01-01T10:00:00"
            ) for i in range(3)],
            "Should continue (3 questions, min is 5)"
        ),
        (
            [QuestionResponse(
                question_index=i,
                question=f"Q{i}",
                answer=f"A{i}",
                timestamp="2025-01-01T10:00:00"
            ) for i in range(5)],
            "Should continue (5 questions, between min-max)"
        ),
        (
            [QuestionResponse(
                question_index=i,
                question=f"Q{i}",
                answer=f"A{i}",
                timestamp="2025-01-01T10:00:00"
            ) for i in range(10)],
            "Should stop (10 questions, reached max)"
        ),
        (
            [QuestionResponse(
                question_index=i,
                question=f"Q{i}",
                answer=f"A{i}",
                timestamp="2025-01-01T10:00:00"
            ) for i in range(12)],
            "Should stop (12 questions, exceeded max)"
        ),
        # Test poor answers
        (
            [
                QuestionResponse(
                    question_index=0,
                    question="Q1",
                    answer="I don't know",
                    timestamp="2025-01-01T10:00:00"
                ),
                QuestionResponse(
                    question_index=1,
                    question="Q2",
                    answer="Not sure about that",
                    timestamp="2025-01-01T10:01:00"
                ),
                QuestionResponse(
                    question_index=2,
                    question="Q3",
                    answer="No idea",
                    timestamp="2025-01-01T10:02:00"
                ),
            ],
            "Should stop (3 'I don't know' answers)"
        ),
    ]

    for qa_list, description in test_cases:
        should_cont = await should_continue_interview(
            previous_qa=qa_list,
            min_questions=5,
            max_questions=10,
            max_poor_answers=3
        )
        status = "✓ Continue" if should_cont else "✗ Stop"
        print(f"  {status} - {description}")


async def test_avoid_repetition():
    """Test that questions don't repeat covered topics"""
    print("\n=== Test: Avoid Topic Repetition ===")

    test_jd = "Python developer with FastAPI, MongoDB, Docker"
    test_resume = "Developer with Python, FastAPI, and Docker experience"

    # Simulate conversation where candidate already discussed FastAPI
    previous_qa = [
        QuestionResponse(
            question_index=0,
            question="Tell me about your experience.",
            answer="I'm a Python developer specializing in FastAPI.",
            timestamp="2025-01-01T10:00:00"
        ),
        QuestionResponse(
            question_index=1,
            question="What's your experience with FastAPI?",
            answer="I've built multiple production APIs with FastAPI, handling millions of requests per day.",
            timestamp="2025-01-01T10:01:00"
        )
    ]

    try:
        # Next question should avoid FastAPI and focus on other topics
        question = await generate_next_question(
            jd=test_jd,
            resume=test_resume,
            previous_qa=previous_qa,
            candidate_name="Test"
        )

        print(f"✓ Generated next question")
        print(f"  Question: {question.question}")
        print(f"  → Should ideally focus on MongoDB or Docker (not FastAPI)")

        # Simple check - question shouldn't heavily focus on FastAPI again
        if "fastapi" in question.question.lower():
            print(f"  ⚠ Warning: Question still mentions FastAPI")
        else:
            print(f"  ✓ Good: Question moved to different topic")

    except Exception as e:
        print(f"✗ Error: {e}")


async def test_poor_answer_detection():
    """Test detection of 'I don't know' type answers and off-topic responses"""
    print("\n=== Test: Poor Answer Detection (Enhanced) ===")
    
    from src.genai.hr_interview.question_generator import is_poor_answer, count_poor_answers
    
    test_answers = [
        ("I don't know", "What's your experience?", True, "Direct 'I don't know'"),
        ("I'm not sure about that", "Tell me about Python", True, "Not sure"),
        ("No idea", "Your MongoDB experience?", True, "No idea"),
        ("I don't have experience with that", "Any Docker experience?", True, "No experience"),
        ("Sorry, I can't recall", "Previous projects?", True, "Can't recall"),
        ("I have 5 years of Python experience building APIs", "Tell me about your experience", False, "Good answer"),
        ("I worked on multiple projects using FastAPI and Django", "What frameworks have you used?", False, "Detailed answer"),
        ("Yes", "Do you know Python?", True, "Too short"),
        ("No", "Have you used Docker?", True, "Too short"),
        ("I think so", "Are you familiar with APIs?", True, "Vague and short"),
        ("um uh hmm", "Tell me about your skills", True, "Just filler words"),
        ("okay", "Can you explain your approach?", True, "One word response"),
        ("what?", "What's your experience with FastAPI?", True, "Confusion"),
        ("I like pizza and movies", "What's your Python experience?", True, "Completely off-topic"),
    ]
    
    print("\n  Testing individual answers:")
    for answer, question, expected_poor, description in test_answers:
        is_poor = is_poor_answer(answer, question)
        status = "✓" if is_poor == expected_poor else "✗"
        print(f"    {status} '{answer[:30]}...' -> Poor: {is_poor} ({description})")
    
    # Test counting with questions
    print("\n  Testing count_poor_answers:")
    test_qa = [
        QuestionResponse(
            question_index=0,
            question="What's your Python experience?",
            answer="I don't know",
            timestamp="2025-01-01T10:00:00"
        ),
        QuestionResponse(
            question_index=1,
            question="Tell me about your projects",
            answer="I have 5 years experience building scalable applications",
            timestamp="2025-01-01T10:01:00"
        ),
        QuestionResponse(
            question_index=2,
            question="Do you know FastAPI?",
            answer="Not sure",
            timestamp="2025-01-01T10:02:00"
        ),
        QuestionResponse(
            question_index=3,
            question="What databases have you used?",
            answer="um uh",
            timestamp="2025-01-01T10:03:00"
        ),
    ]
    
    poor_count = count_poor_answers(test_qa)
    expected_count = 3  # "I don't know", "Not sure", and "um uh"
    status = "✓" if poor_count == expected_count else "✗"
    print(f"    {status} Found {poor_count} poor answers (expected {expected_count})")


async def main():
    print("\n" + "="*70)
    print("Running Question Generator Tests (Dynamic Generation)")
    print("="*70)
    
    await test_first_question_generation()
    await test_dynamic_question_generation()
    await test_progressive_question_types()
    await test_should_continue()
    await test_avoid_repetition()
    await test_poor_answer_detection()
    
    print("\n" + "="*70)
    print("All Question Generator Tests Completed")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())