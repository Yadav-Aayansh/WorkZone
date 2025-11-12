import asyncio
import sys
import os

from src.genai.hr_interview.answer_analyzer import analyze_answer_quality
from src.genai.schemas.hr_interview import AnswerAnalysis

async def test_answer_analysis():
    print("\n=== Test: Answer Quality Analysis ===")

    test_cases = [
        {
            "question": "What is your experience with Python?",
            "answer": "I don't know much about Python.",
            "focus_area": "technical",
        },
        {
            "question": "Tell me about a challenging project.",
            "answer": "I worked on a project. It was difficult.",
            "focus_area": "experience",
        },
        {
            "question": "How do you handle tight deadlines?",
            "answer": "I prioritize tasks, break them into chunks, communicate blockers, "
                      "and delivered an API last month under a 2-week crunch.",
            "focus_area": "soft_skills",
        }
    ]

    for i, t in enumerate(test_cases, start=1):
        print(f"\n--- Test Case {i} ---")
        try:
            result: AnswerAnalysis = await analyze_answer_quality(
                t["question"], t["answer"], t["focus_area"]
            )

            print(f" Score: {result.score}/10")
            print(f" Strength: {result.strength}")
            print(f" Weakness: {result.weakness}")

        except Exception as e:
            print(f" Error analyzing answer: {e}")


async def main():
    print("Running Answer Analyzer Tests")
    print("================================")
    await test_answer_analysis()


if __name__ == "__main__":
    asyncio.run(main())
