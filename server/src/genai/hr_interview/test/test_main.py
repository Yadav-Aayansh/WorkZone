import os
import sys
import asyncio

# Import main functions & schemas
from src.genai.hr_interview.main import (
    start_interview,
    process_text_answer,
    generate_final_report
)

from src.genai.schemas.hr_interview import (
    StartInterviewRequest,
    ProcessTextAnswerRequest,
    GenerateReportRequest,
)

# Import Redis client for cleanup
from src.core.redis import redis_client

TEST_RESUME_BLOB = "resumes/resume.pdf"
SESSION_ID = "local_test_session_001"

# Sample markdown JD
TEST_JD_MARKDOWN = """
# Backend Developer Position

## Role Overview
We are seeking an experienced Backend Developer to join our engineering team.

## Required Skills
- 3+ years of Python development experience
- Strong experience with FastAPI or Flask
- Experience with MongoDB or PostgreSQL
- REST API design and development
- Docker and containerization

## Nice to Have
- Experience with microservices architecture
- Knowledge of AWS/GCP
- CI/CD pipeline experience
- Machine learning basics

## Responsibilities
- Design and develop scalable backend services
- Write clean, maintainable code
- Collaborate with frontend team
- Participate in code reviews
"""


async def cleanup_test_session():
    """Clean up test session from Redis before starting"""
    try:
        # Check if session exists
        session_data = await redis_client.get_session(SESSION_ID)
        if session_data:
            await redis_client.delete_session(SESSION_ID)
            print("✓ Cleaned up existing test session")
    except Exception as e:
        print(f"⚠ Warning: Could not clean up session: {e}")


async def verify_redis_connection():
    """Verify Redis is connected and accessible"""
    try:
        # Test connection by trying to get a non-existent key
        await redis_client.client.ping()
        print("✓ Redis connection verified")
        return True
    except Exception as e:
        print(f"✗ Redis connection failed: {e}")
        print("\nPlease ensure Redis is running:")
        print("  Docker: docker run -d -p 6379:6379 redis:latest")
        print("  Local: redis-server")
        return False


async def run_interview_test():
    """Main async interview test flow"""
    
    print("\n" + "="*70)
    print("="*70)

    # Verify Redis connection
    print("\n[PRE-CHECK] Verifying Redis Connection")
    print("-" * 70)
    if not await verify_redis_connection():
        print("\n✗ Test cannot proceed without Redis connection")
        return

    # Clean up any existing test session
    await cleanup_test_session()

    print("\n[STEP 1] Starting Interview")
    print("-" * 70)

    start_req = StartInterviewRequest(
        session_id=SESSION_ID,
        resume_blob_name=TEST_RESUME_BLOB,
        jd_text=TEST_JD_MARKDOWN,
        candidate_name="Test Candidate",
        position="Backend Developer"
    )

    try:
        start_res = await start_interview(start_req)
        print("✓ Interview Started (Session saved to Redis)")
        print("Session ID:", start_res.session_id)
        print("First Question:", start_res.first_question.question)
        print("Question Type:", start_res.first_question.type)
        print("Focus Area:", start_res.first_question.focus_area)
        print("First Question Audio URL:", start_res.first_question_audio_url)
        
        # Verify session exists in Redis
        session_data = await redis_client.get_session(SESSION_ID)
        if session_data:
            print("✓ Session verified in Redis")
        else:
            print("✗ Warning: Session not found in Redis")
    except Exception as e:
        print("✗ Error starting interview:", e)
        import traceback
        traceback.print_exc()
        return

    
    # STEP 2 – INTERACTIVE QUESTION LOOP WITH DYNAMIC GENERATION
    
    print("\n[STEP 2] Interactive Q&A Session")
    print("-" * 70)

    current_index = 0

    # First question from start response
    print(f"\nQ{current_index + 1}: {start_res.first_question.question}")
    print(f"   Type: {start_res.first_question.type} | Focus: {start_res.first_question.focus_area}")

    while True:
        # Ask user for answer
        user_answer = input("Your Answer: ")

        # Build request
        req = ProcessTextAnswerRequest(
            session_id=SESSION_ID,
            answer_text=user_answer
        )

        # Process answer
        try:
            res = await process_text_answer(req)
            print("✓ Answer processed (Session updated in Redis)")
        except Exception as e:
            print("✗ Error processing answer:", e)
            import traceback
            traceback.print_exc()
            return

        # Check if interview is complete
        if res.status == "completed":
            print("\n✓ Interview Completed!")
            print(f"Total Questions Asked: {res.total_questions_asked}")
            if res.completion_reason:
                reason_text = {
                    "poor_answers": "Too many 'I don't know' answers (3+)",
                    "max_questions": "Maximum questions reached (10)",
                    "min_questions_reached": "Minimum questions completed"
                }
                print(f"Completion Reason: {reason_text.get(res.completion_reason, res.completion_reason)}")
            if res.poor_answer_count is not None:
                print(f"Poor Answer Count: {res.poor_answer_count}")
            break

        # Display next dynamically generated question
        current_index = res.next_question_index
        
        # Show poor answer warning if applicable
        if res.poor_answer_count and res.poor_answer_count > 0:
            print(f"\n⚠ Warning: {res.poor_answer_count} poor answer(s) detected. Interview may end early after 3.")
        
        print(f"\nQ{current_index + 1}: {res.next_question.question}")
        print(f"   Type: {res.next_question.type} | Focus: {res.next_question.focus_area}")
        print(f"   Total Questions So Far: {res.total_questions_asked}")

    # STEP 3 – GENERATE FINAL MARKDOWN REPORT
    print("\n" + "-" * 70)
    print("[STEP 3] Generating Final Report")
    print("-" * 70)

    report_req = GenerateReportRequest(session_id=SESSION_ID)

    try:
        report_res = await generate_final_report(report_req)
        report = report_res.report
        print("✓ Report generated (Session retrieved from Redis)")
    except Exception as e:
        print("✗ Error generating report:", e)
        import traceback
        traceback.print_exc()
        return

    print("\n" + "="*70)
    print("INTERVIEW REPORT")
    print("="*70)
    
    print("\n📊 OVERALL ASSESSMENT")
    print("Candidate:", report.candidate_name)
    print("Position:", report.position)
    print("Overall Score:", f"{report.overall_score}/100")

    print("\n✨ STRENGTHS:")
    for s in report.strengths:
        print(" •", s)

    print("\n⚠ WEAKNESSES:")
    for w in report.weaknesses:
        print(" •", w)

    print("\n🔧 TECHNICAL FIT:")
    print(report.technical_fit)

    print("\n💬 COMMUNICATION ASSESSMENT:")
    print(report.communication_assessment)

    print("\n📋 RECOMMENDATIONS:")
    print(report.recommendations)

    print("\n📄 MARKDOWN REPORT:")
    if report_res.markdown_url:
        print(f"URL: {report_res.markdown_url}")
    else:
        print("✓ Markdown report returned in response (not uploaded to GCP)")
        print(f"Length: {len(report_res.markdown_report)} characters")

    print("\n📝 DETAILED Q&A:")
    for i, qa in enumerate(report.detailed_qa, 1):
        print(f"\n--- Question {i} (Score: {qa.score}/10) ---")
        print(f"Q: {qa.question}")
        print(f"A: {qa.answer}")
        print(f"✓ Strength: {qa.strength}")
        print(f"⚠ Weakness: {qa.weakness}")

    # Optional: Display markdown report preview
    print("\n" + "-" * 70)
    print("[MARKDOWN REPORT PREVIEW - First 500 chars]")
    print("-" * 70)
    print(report_res.markdown_report[:500] + "...")

    # Session cleanup option
    print("\n" + "-" * 70)
    print("[POST-TEST CLEANUP]")
    print("-" * 70)
    cleanup_choice = input("Delete test session from Redis? (y/n): ").lower()
    if cleanup_choice == 'y':
        try:
            await redis_client.delete_session(SESSION_ID)
            print("✓ Test session deleted from Redis")
        except Exception as e:
            print(f"✗ Error deleting session: {e}")
    else:
        print("ℹ Test session retained in Redis")
        print(f"  Key: interview_session:{SESSION_ID}")
        print(f"  TTL: ~24 hours")

    print("\n" + "="*70)
    print("FULL INTERVIEW TEST COMPLETED SUCCESSFULLY")
    print("="*70 + "\n")


# ENTRY POINT
if __name__ == "__main__":
    # Run the async interview test
    asyncio.run(run_interview_test())
