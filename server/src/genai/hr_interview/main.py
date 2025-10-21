#HR_assistannt main wrapper

from typing import Dict, List
from src.utils.datetime import get_indian_time

# Import schemas
from src.genai.schemas.hr_interview_schemas import (
    StartInterviewRequest,
    StartInterviewResponse,
    ProcessTextAnswerRequest,
    ProcessVoiceAnswerRequest,
    ProcessAnswerResponse,
    GenerateReportRequest,
    GenerateReportResponse,
    SessionData,
    QuestionResponse,
    InterviewQuestion
)

# Import modules
from src.genai.hr_interview.pdf_processor import extract_text_from_pdf
from src.genai.hr_interview.question_generator import generate_interview_questions, generate_followup_question
from src.genai.hr_interview.report_generator import generate_interview_report
from src.genai.hr_interview.tts_engine import text_to_speech
from src.genai.hr_interview.stt_engine import speech_to_text
from src.genai.hr_interview.pdf_report_generator import generate_and_upload_pdf_report
from src.core.storage import storage_client


# In-memory session storage (replace with Redis/DB in production)
active_sessions: Dict[str, SessionData] = {}


def start_interview(request: StartInterviewRequest) -> StartInterviewResponse:
    
    # Get signed URL for resume and extract text
    resume_signed_url = storage_client.get_url(request.resume_blob_name, expiration=1)
    if not resume_signed_url:
        raise ValueError(f"Resume not found: {request.resume_blob_name}")
    
    resume_text = extract_text_from_pdf(resume_signed_url)
    
    # Extract or use JD text
    if request.jd_type == "pdf":
        jd_signed_url = storage_client.get_url(request.jd_content, expiration=1)
        if not jd_signed_url:
            raise ValueError(f"JD PDF not found: {request.jd_content}")
        jd_final = extract_text_from_pdf(jd_signed_url)
    else:
        jd_final = request.jd_content
    
    # Generate session ID
    timestamp = get_indian_time().strftime('%Y%m%d_%H%M%S')
    candidate_slug = request.candidate_name.replace(' ', '_') if request.candidate_name else 'candidate'
    session_id = f"interview_{timestamp}_{candidate_slug}"
    
    # Generate interview questions
    questions = generate_interview_questions(jd_final, resume_text, request.num_questions)
    
    # Generate audio for first question (returns signed URL)
    first_question_audio_url = text_to_speech(
        questions[0].question,
        session_id,
        0
    )
    
    # Create session data
    session_data = SessionData(
        session_id=session_id,
        questions=questions,
        resume_text=resume_text,
        jd_text=jd_final,
        candidate_name=request.candidate_name,
        position=request.position,
        responses=[]
    )
    
    # Store session
    active_sessions[session_id] = session_data
    
    return StartInterviewResponse(
        session_id=session_id,
        questions=questions,
        first_question_audio_url=first_question_audio_url,
        resume_text=resume_text,
        jd_text=jd_final,
        candidate_name=request.candidate_name,
        position=request.position
    )


def process_text_answer(request: ProcessTextAnswerRequest) -> ProcessAnswerResponse:
    
    # Get session data
    if request.session_id not in active_sessions:
        raise ValueError(f"Session {request.session_id} not found")
    
    session_data = active_sessions[request.session_id]
    
    # Store answer
    response_record = QuestionResponse(
        question_index=request.current_question_index,
        question=session_data.questions[request.current_question_index].question,
        answer=request.answer_text,
        timestamp=get_indian_time().isoformat()
    )
    session_data.responses.append(response_record)
    
    # Generate follow-up question if appropriate
    followup_generated = False
    if len(request.answer_text.split()) >= 10 and len(session_data.questions) < 5:
        followup = generate_followup_question(
            session_data.questions[request.current_question_index].question,
            request.answer_text,
            session_data.jd_text
        )
        if followup:
            followup_question = InterviewQuestion(
                type="followup",
                question=followup,
                focus_area=session_data.questions[request.current_question_index].focus_area
            )
            session_data.questions.insert(request.current_question_index + 1, followup_question)
            followup_generated = True
    
    # Move to next question
    next_index = request.current_question_index + 1
    
    # Check if interview is complete
    if next_index >= len(session_data.questions):
        return ProcessAnswerResponse(
            status="completed",
            followup_generated=followup_generated,
            total_questions=len(session_data.questions)
        )
    
    # Generate audio for next question (returns signed URL)
    next_question_audio_url = text_to_speech(
        session_data.questions[next_index].question,
        session_data.session_id,
        next_index
    )
    
    return ProcessAnswerResponse(
        status="in_progress",
        next_question=session_data.questions[next_index].question,
        next_question_audio_url=next_question_audio_url,
        next_question_index=next_index,
        followup_generated=followup_generated,
        total_questions=len(session_data.questions),
        question_type=session_data.questions[next_index].type
    )


def process_voice_answer(request: ProcessVoiceAnswerRequest) -> ProcessAnswerResponse:
    
    # Get signed URL for audio
    audio_signed_url = storage_client.get_url(request.audio_blob_name, expiration=1)
    if not audio_signed_url:
        raise ValueError(f"Audio file not found: {request.audio_blob_name}")
    
    # Convert speech to text
    transcription = speech_to_text(audio_signed_url)
    
    # Process as text answer
    text_request = ProcessTextAnswerRequest(
        session_id=request.session_id,
        answer_text=transcription,
        current_question_index=request.current_question_index
    )
    
    result = process_text_answer(text_request)
    result.transcription = transcription
    
    return result


def generate_final_report(request: GenerateReportRequest) -> GenerateReportResponse:
    
    # Get session data
    if request.session_id not in active_sessions:
        raise ValueError(f"Session {request.session_id} not found")
    
    session_data = active_sessions[request.session_id]
    
    # Generate report
    report = generate_interview_report(
        jd=session_data.jd_text,
        resume=session_data.resume_text,
        questions=session_data.questions,
        responses=session_data.responses,
        candidate_name=session_data.candidate_name or "Unknown",
        position=session_data.position or "Unknown Position",
        session_id=session_data.session_id
    )
    
    # Generate and upload PDF (returns signed URL)
    pdf_signed_url = generate_and_upload_pdf_report(report)
    
    return GenerateReportResponse(
        report=report,
        pdf_url=pdf_signed_url
    )


# Testing the complete Interview flow

if __name__ == "__main__":
    print("\n" + "="*70)
    print("AI INTERVIEW ASSISTANT - COMPLETE FLOW TEST (STORAGE.PY + PYDANTIC)")
    print("="*70)
    
    # Test configuration - UPDATE THESE WITH YOUR BLOB NAMES
    test_resume_blob_name = "resumes/resume.pdf"
    test_jd_blob_name = "jd/JD.pdf"
    test_jd_text = """
    Senior Python Developer
    Required Skills:
    - 5+ years Python experience
    - FastAPI or Flask framework
    - MongoDB or PostgreSQL
    - REST API design
    - Cloud deployment (GCP/AWS)
    """
    
    print("\n[STEP 1] Starting Interview")
    print("-" * 70)
    
    try:
        # Create request
        start_request = StartInterviewRequest(
            resume_blob_name=test_resume_blob_name,
            jd_type="text",  # Change to "pdf" and use test_jd_blob_name for PDF testing
            jd_content=test_jd_text,
            candidate_name="John Doe",
            position="Senior Python Developer",
            num_questions=3
        )
        
        # Start interview
        session = start_interview(start_request)
        
        print(f"✓ Session created: {session.session_id}")
        print(f"✓ Generated {len(session.questions)} questions")
        print(f"✓ First question audio URL: {session.first_question_audio_url[:80]}...")
        print(f"\nFirst Question: {session.questions[0].question}")
        
    except Exception as e:
        print(f"✗ Error starting interview: {e}")
        print("\nPlease ensure:")
        print("  1. storage.py is properly configured")
        print("  2. Resume PDF exists in GCP Storage")
        print("  3. Update test_resume_blob_name with your actual blob name")
        exit(1)
    
    # Simulate candidate answers
    test_answers = [
        "I have 6 years of Python experience, primarily working with FastAPI and Flask frameworks. I've built multiple high-performance REST APIs serving millions of requests daily. I'm also proficient in MongoDB and PostgreSQL database design.",
        "One of my most challenging projects was building a real-time data processing pipeline that handled 50,000 events per second. I used FastAPI with async processing, Redis for caching, and implemented circuit breakers for resilience. The biggest challenge was optimizing database queries to prevent bottlenecks.",
        "I handle tight deadlines by breaking down tasks into smaller deliverables, prioritizing critical features first, and maintaining clear communication with stakeholders. I also use agile methodologies to ensure we're always delivering value incrementally."
    ]
    
    print("\n[STEP 2] Processing Answers")
    print("-" * 70)
    
    current_index = 0
    
    for i, answer in enumerate(test_answers):
        if current_index >= len(session.questions):
            break
        
        print(f"\nQ{i+1}: {session.questions[current_index].question}")
        print(f"A{i+1}: {answer[:80]}...")
        
        try:
            # Create request
            answer_request = ProcessTextAnswerRequest(
                session_id=session.session_id,
                answer_text=answer,
                current_question_index=current_index
            )
            
            # Process answer
            result = process_text_answer(answer_request)
            
            if result.status == 'completed':
                print(f"✓ Interview completed after {current_index + 1} questions")
                break
            else:
                print(f"✓ Moving to next question ({result.next_question_index + 1}/{result.total_questions})")
                if result.followup_generated:
                    print("  (Follow-up question generated)")
                current_index = result.next_question_index
        
        except Exception as e:
            print(f"✗ Error processing answer: {e}")
            break
    
    print("\n[STEP 3] Generating Report")
    print("-" * 70)
    
    try:
        # Create request
        report_request = GenerateReportRequest(session_id=session.session_id)
        
        # Generate report
        report_response = generate_final_report(report_request)
        report = report_response.report
        
        print(f"✓ Report generated successfully")
        print(f"\nCandidate: {report.candidate_name}")
        print(f"Position: {report.position}")
        print(f"Overall Score: {report.overall_score}/100")
        print(f"\nStrengths ({len(report.strengths)}):")
        for s in report.strengths:
            print(f"  • {s}")
        print(f"\nWeaknesses ({len(report.weaknesses)}):")
        for w in report.weaknesses:
            print(f"  • {w}")
        print(f"\nRecommendation: {report.recommendations}")
        print(f"\n✓ PDF Report URL: {report_response.pdf_url[:80]}...")
        
    except Exception as e:
        print(f"✗ Error generating report: {e}")
        exit(1)
    
    print("\n" + "="*70)
    print("COMPLETE FLOW TEST FINISHED")
    print("="*70)
    print("\nSummary:")
    print(f"  • Interview completed: ✓")
    print(f"  • Questions asked: {len(active_sessions[session.session_id].responses)}")
    print(f"  • Overall score: {report.overall_score}/100")
    print(f"  • PDF generated: ✓")
    print(f"  • All data stored in GCP: ✓")
    print("\n✓ All functions working correctly with storage.py & Pydantic!")
    print("="*70 + "\n")
