import os
import sys
import asyncio

# # Ensure src/ is in import path (same fix as your earlier tests)
# ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# sys.path.append(ROOT_DIR)

from src.genai.hr_interview.report_generator import generate_interview_report
from src.genai.schemas.hr_interview import (
    InterviewQuestion,
    QuestionResponse
)

print("\n=== Testing Interview Report Generator ===\n")


async def run_test():
    # Dummy test data
    test_jd = "Python Developer with FastAPI and MongoDB experience"
    test_resume = "John Doe - 5 years Python, specialized in backend development"

    test_questions = [
        InterviewQuestion(
            question="Explain Python experience.",
            type="technical",
            focus_area="technical"
        ),
        InterviewQuestion(
            question="Describe a challenging project.",
            type="experience",
            focus_area="experience"
        ),
        InterviewQuestion(
            question="How do you handle pressure?",
            type="behavioral",
            focus_area="soft_skills"
        ),
    ]

    test_responses = [
        QuestionResponse(
            question_index=0,
            question=test_questions[0].question,
            answer="I have 5 years of hands-on Python experience.",
            timestamp="2025-01-01T10:00:00"
        ),
        QuestionResponse(
            question_index=1,
            question=test_questions[1].question,
            answer="Built a scalable API handling heavy load.",
            timestamp="2025-01-01T10:02:00"
        ),
        QuestionResponse(
            question_index=2,
            question=test_questions[2].question,
            answer="I stay calm and prioritize tasks.",
            timestamp="2025-01-01T10:04:00"
        ),
    ]

    print("→ Calling generate_interview_report() ...")

    report = await generate_interview_report(
        jd=test_jd,
        resume=test_resume,
        questions=test_questions,
        responses=test_responses,
        candidate_name="John Doe",
        position="Python Developer",
        session_id="test_session_001",
    )

    print("\n Report generated successfully!\n")
    
    print(f"Candidate: {report.candidate_name}")
    print(f"Position: {report.position}")
    print(f"Overall Score: {report.overall_score}/100\n")

    print("Strengths:")
    for s in report.strengths:
        print(f"  - {s}")

    print("\nWeaknesses:")
    for w in report.weaknesses:
        print(f"  - {w}")

    print("\nTechnical Fit:")
    print(report.technical_fit)

    print("\nCommunication Assessment:")
    print(report.communication_assessment)

    print("\nRecommendation:")
    print(report.recommendations)

    print(f"\nDetailed Q&A Count: {len(report.detailed_qa)}")
    print("\n=== END TEST ===\n")


# Run async test
if __name__ == "__main__":
    asyncio.run(run_test())
