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
TEST_JD_BLOB = "jd/JD.pdf"                     
SESSION_ID = "local_test_session_001"


# FULL INTERVIEW FLOW (INTERACTIVE)

if __name__ == "__main__":
    print("\n" + "="*70)
    print("AI INTERVIEW ASSISTANT — FULL INTERVIEW TEST")
    print("="*70)

    print("\n[STEP 1] Starting Interview")
    print("-" * 70)

    start_req = StartInterviewRequest(
        session_id=SESSION_ID,
        resume_blob_name=TEST_RESUME_BLOB,
        jd_type="pdf",                  # pdf mode
        jd_content=TEST_JD_BLOB,        # blob name of JD PDF
        candidate_name="Test Candidate",
        position="Backend Developer",
        num_questions=3
    )

    try:
        start_res = asyncio.run(start_interview(start_req))
        print(" Interview Started")
        print("Session ID:", start_res.session_id)
        print("First Question Audio URL:", start_res.first_question_audio_url)
    except Exception as e:
        print("✗ Error starting interview:", e)
        exit(1)

    
    # STEP 2 — INTERACTIVE QUESTION LOOP
    
    print("\n[STEP 2] Answer Questions")
    print("-" * 70)

    current_index = 0

    while True:
        # ALWAYS fetch updated questions list from active session
        session_questions = active_sessions[SESSION_ID].questions

        # Print current question safely
        print(f"\nQ{current_index + 1}: {session_questions[current_index].question}")

        #Ask user for answer
        user_answer = input("Your Answer: ")

        # Build request
        req = ProcessTextAnswerRequest(
            session_id=SESSION_ID,
            answer_text=user_answer,
            current_question_index=current_index
        )

        # Process answer
        try:
            res = asyncio.run(process_text_answer(req))
        except Exception as e:
            print("✗ Error processing answer:", e)
            exit(1)

        # Check if interview is complete
        if res.status == "completed":
            print("\n Interview Completed!")
            break

        # Move to next updated index
        current_index = res.next_question_index

        print("→ Moving to next question...")

    # STEP 3 — GENERATE FINAL MARKDOWN REPORT
    print("\n" + "-" * 70)
    print("[STEP 3] Generating Final Report")
    print("-" * 70)

    report_req = GenerateReportRequest(session_id=SESSION_ID)

    try:
        report_res = asyncio.run(generate_final_report(report_req))
        report = report_res.report
    except Exception as e:
        print("✗ Error generating report:", e)
        exit(1)

    print("\nREPORT GENERATED!")
    print("Candidate:", report.candidate_name)
    print("Position:", report.position)
    print("Score:", report.overall_score)

    print("\nStrengths:")
    for s in report.strengths:
        print(" •", s)

    print("\nWeaknesses:")
    for w in report.weaknesses:
        print(" •", w)

    print("\n Markdown Report uploaded to GCP:")
    print(report_res.markdown_url)

    print("\n" + "="*70)
    print("FULL INTERVIEW TEST COMPLETED SUCCESSFULLY")
    print("="*70 + "\n")
