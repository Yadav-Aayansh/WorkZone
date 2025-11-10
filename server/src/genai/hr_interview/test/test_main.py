# import os
# import sys
# import asyncio

# # Import main functions & schemas
# from src.genai.hr_interview.main import (
#     start_interview,
#     process_text_answer,
#     generate_final_report,
#     active_sessions
# )

# from src.genai.schemas.hr_interview_schemas import (
#     StartInterviewRequest,
#     ProcessTextAnswerRequest,
#     GenerateReportRequest,
# )

# TEST_RESUME_BLOB = "resumes/resume.pdf"
# SESSION_ID = "local_test_session_001"

# # Sample markdown JD
# TEST_JD_MARKDOWN = """
# # Backend Developer Position

# ## Role Overview
# We are seeking an experienced Backend Developer to join our engineering team.

# ## Required Skills
# - 3+ years of Python development experience
# - Strong experience with FastAPI or Flask
# - Experience with MongoDB or PostgreSQL
# - REST API design and development
# - Docker and containerization

# ## Nice to Have
# - Experience with microservices architecture
# - Knowledge of AWS/GCP
# - CI/CD pipeline experience
# - Machine learning basics

# ## Responsibilities
# - Design and develop scalable backend services
# - Write clean, maintainable code
# - Collaborate with frontend team
# - Participate in code reviews
# """


# # FULL INTERVIEW FLOW (INTERACTIVE WITH DYNAMIC QUESTIONS)

# if __name__ == "__main__":
#     print("\n" + "="*70)
#     print("AI INTERVIEW ASSISTANT – FULL INTERVIEW TEST (DYNAMIC QUESTIONS)")
#     print("="*70)

#     print("\n[STEP 1] Starting Interview")
#     print("-" * 70)

#     start_req = StartInterviewRequest(
#         session_id=SESSION_ID,
#         resume_blob_name=TEST_RESUME_BLOB,
#         jd_text=TEST_JD_MARKDOWN,  # Now using markdown directly
#         candidate_name="Test Candidate",
#         position="Backend Developer"
#     )

#     try:
#         start_res = asyncio.run(start_interview(start_req))
#         print("✓ Interview Started")
#         print("Session ID:", start_res.session_id)
#         print("First Question:", start_res.first_question.question)
#         print("Question Type:", start_res.first_question.type)
#         print("Focus Area:", start_res.first_question.focus_area)
#         print("First Question Audio URL:", start_res.first_question_audio_url)
#     except Exception as e:
#         print("✗ Error starting interview:", e)
#         import traceback
#         traceback.print_exc()
#         exit(1)

    
#     # STEP 2 – INTERACTIVE QUESTION LOOP WITH DYNAMIC GENERATION
    
#     print("\n[STEP 2] Answer Questions (Questions Generated Dynamically)")
#     print("-" * 70)
#     print("Note: Each question is generated based on your previous answers")
#     print("-" * 70)

#     current_index = 0

#     # First question from start response
#     print(f"\nQ{current_index + 1}: {start_res.first_question.question}")
#     print(f"   Type: {start_res.first_question.type} | Focus: {start_res.first_question.focus_area}")

#     while True:
#         # Ask user for answer
#         user_answer = input("Your Answer: ")

#         # Build request - no longer need current_question_index
#         req = ProcessTextAnswerRequest(
#             session_id=SESSION_ID,
#             answer_text=user_answer
#         )

#         # Process answer
#         try:
#             res = asyncio.run(process_text_answer(req))
#         except Exception as e:
#             print("✗ Error processing answer:", e)
#             import traceback
#             traceback.print_exc()
#             exit(1)

#         # Check if interview is complete
#         if res.status == "completed":
#             print("\n✓ Interview Completed!")
#             print(f"Total Questions Asked: {res.total_questions_asked}")
#             break

#         # Display next dynamically generated question
#         current_index = res.next_question_index
#         print(f"\n→ Next question generated based on your answer...")
#         print(f"Q{current_index + 1}: {res.next_question.question}")
#         print(f"   Type: {res.next_question.type} | Focus: {res.next_question.focus_area}")
#         print(f"   Total Questions So Far: {res.total_questions_asked}")

#     # STEP 3 – GENERATE FINAL MARKDOWN REPORT
#     print("\n" + "-" * 70)
#     print("[STEP 3] Generating Final Report")
#     print("-" * 70)

#     report_req = GenerateReportRequest(session_id=SESSION_ID)

#     try:
#         report_res = asyncio.run(generate_final_report(report_req))
#         report = report_res.report
#     except Exception as e:
#         print("✗ Error generating report:", e)
#         import traceback
#         traceback.print_exc()
#         exit(1)

#     print("\n✓ REPORT GENERATED!")
#     print("Candidate:", report.candidate_name)
#     print("Position:", report.position)
#     print("Score:", report.overall_score)

#     print("\nStrengths:")
#     for s in report.strengths:
#         print(" •", s)

#     print("\nWeaknesses:")
#     for w in report.weaknesses:
#         print(" •", w)

#     print("\nTechnical Fit:")
#     print(report.technical_fit)

#     print("\nCommunication Assessment:")
#     print(report.communication_assessment)

#     print("\nRecommendations:")
#     print(report.recommendations)

#     print("\n✓ Markdown Report uploaded to GCP:")
#     print(report_res.markdown_url)

#     print("\nDetailed Q&A:")
#     for i, qa in enumerate(report.detailed_qa, 1):
#         print(f"\nQ{i}: {qa.question}")
#         print(f"A{i}: {qa.answer}")
#         print(f"Score: {qa.score}/10")

#     print("\n" + "="*70)
#     print("FULL INTERVIEW TEST COMPLETED SUCCESSFULLY")
#     print("="*70 + "\n")


import os
import sys
import asyncio

# Import main functions & schemas
from src.genai.hr_interview.main import (
    start_interview,
    process_text_answer,
    generate_final_report,
    active_sessions
)

from src.genai.schemas.hr_interview_schemas import (
    StartInterviewRequest,
    ProcessTextAnswerRequest,
    GenerateReportRequest,
)

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


# FULL INTERVIEW FLOW (INTERACTIVE WITH DYNAMIC QUESTIONS)

if __name__ == "__main__":
    print("\n" + "="*70)
    print("AI INTERVIEW ASSISTANT – FULL INTERVIEW TEST (DYNAMIC QUESTIONS)")
    print("="*70)

    print("\n[STEP 1] Starting Interview")
    print("-" * 70)

    start_req = StartInterviewRequest(
        session_id=SESSION_ID,
        resume_blob_name=TEST_RESUME_BLOB,
        jd_text=TEST_JD_MARKDOWN,  # Now using markdown directly
        candidate_name="Test Candidate",
        position="Backend Developer"
    )

    try:
        start_res = asyncio.run(start_interview(start_req))
        print("✓ Interview Started")
        print("Session ID:", start_res.session_id)
        print("First Question:", start_res.first_question.question)
        print("Question Type:", start_res.first_question.type)
        print("Focus Area:", start_res.first_question.focus_area)
        print("First Question Audio URL:", start_res.first_question_audio_url)
    except Exception as e:
        print("✗ Error starting interview:", e)
        import traceback
        traceback.print_exc()
        exit(1)

    
    # STEP 2 – INTERACTIVE QUESTION LOOP WITH DYNAMIC GENERATION
    

    print("-" * 70)

    current_index = 0

    # First question from start response
    print(f"\nQ{current_index + 1}: {start_res.first_question.question}")
    print(f"   Type: {start_res.first_question.type} | Focus: {start_res.first_question.focus_area}")

    while True:
        # Ask user for answer
        user_answer = input("Your Answer: ")

        # Build request - no longer need current_question_index
        req = ProcessTextAnswerRequest(
            session_id=SESSION_ID,
            answer_text=user_answer
        )

        # Process answer
        try:
            res = asyncio.run(process_text_answer(req))
        except Exception as e:
            print("✗ Error processing answer:", e)
            import traceback
            traceback.print_exc()
            exit(1)

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
        
      
        print(f"Q{current_index + 1}: {res.next_question.question}")
        print(f"   Type: {res.next_question.type} | Focus: {res.next_question.focus_area}")
        print(f"   Total Questions So Far: {res.total_questions_asked}")

    # STEP 3 – GENERATE FINAL MARKDOWN REPORT
    print("\n" + "-" * 70)
    print("[STEP 3] Generating Final Report")
    print("-" * 70)

    report_req = GenerateReportRequest(session_id=SESSION_ID)

    try:
        report_res = asyncio.run(generate_final_report(report_req))
        report = report_res.report
    except Exception as e:
        print("✗ Error generating report:", e)
        import traceback
        traceback.print_exc()
        exit(1)

    print("\n✓ REPORT GENERATED!")
    print("Candidate:", report.candidate_name)
    print("Position:", report.position)
    print("Score:", report.overall_score)

    print("\nStrengths:")
    for s in report.strengths:
        print(" •", s)

    print("\nWeaknesses:")
    for w in report.weaknesses:
        print(" •", w)

    print("\nTechnical Fit:")
    print(report.technical_fit)

    print("\nCommunication Assessment:")
    print(report.communication_assessment)

    print("\nRecommendations:")
    print(report.recommendations)

    print("\n✓ Markdown Report uploaded to GCP:")
    print(report_res.markdown_url)

    print("\nDetailed Q&A:")
    for i, qa in enumerate(report.detailed_qa, 1):
        print(f"\nQ{i}: {qa.question}")
        print(f"A{i}: {qa.answer}")
        print(f"Score: {qa.score}/10")

    print("\n" + "="*70)
    print("FULL INTERVIEW TEST COMPLETED SUCCESSFULLY")
    print("="*70 + "\n")