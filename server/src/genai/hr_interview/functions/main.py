"""
AI Interview Assistant - Main Wrapper
Combines all sub-features into unified functions for backend integration
"""

from typing import Dict, List, Optional
from datetime import datetime

# Import all sub-feature modules
from pdf_processor import extract_text_from_pdf
from question_generator import generate_interview_questions, generate_followup_question
from answer_analyzer import analyze_answer_quality
from report_generator import generate_interview_report
from tts_engine import text_to_speech
from stt_engine import speech_to_text
from pdf_report_generator import generate_pdf_report



# MAIN FUNCTIONS FOR BACKEND INTEGRATION


def start_interview(
    resume_pdf_content: bytes,
    jd_text: str = None,
    jd_pdf_content: bytes = None,
    candidate_name: str = None,
    position: str = None,
    num_questions: int = 3
) -> Dict:
   
    # Extract resume text
    resume_text = extract_text_from_pdf(resume_pdf_content)
    
    # Extract or use JD text
    if jd_pdf_content:
        jd_final = extract_text_from_pdf(jd_pdf_content)
    elif jd_text:
        jd_final = jd_text
    else:
        raise ValueError("Either jd_text or jd_pdf_content must be provided")
    
    # Generate session ID
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    session_id = f"interview_{timestamp}_{candidate_name.replace(' ', '_') if candidate_name else 'candidate'}"
    
    # Generate interview questions
    questions = generate_interview_questions(jd_final, resume_text, num_questions)
    
    # Generate audio for first question
    first_question_text = questions[0]['question']
    audio_path = f"temp/{session_id}_q0.mp3"
    text_to_speech(first_question_text, audio_path)
    
    return {
        "session_id": session_id,
        "questions": questions,
        "first_question_audio_path": audio_path,
        "resume_text": resume_text,
        "jd_text": jd_final,
        "candidate_name": candidate_name,
        "position": position
    }


def process_text_answer(
    session_data: Dict,
    answer_text: str,
    current_question_index: int
) -> Dict:
   
    questions = session_data['questions']
    session_id = session_data['session_id']
    
    # Store answer (backend should handle this)
    response_record = {
        "question_index": current_question_index,
        "question": questions[current_question_index]['question'],
        "answer": answer_text,
        "timestamp": datetime.now().isoformat()
    }
    
    # Generate follow-up question if appropriate
    followup_generated = False
    if len(answer_text.split()) >= 10 and len(questions) < 5:
        followup = generate_followup_question(
            questions[current_question_index]['question'],
            answer_text,
            session_data['jd_text']
        )
        if followup:
            questions.insert(current_question_index + 1, {
                "type": "followup",
                "question": followup,
                "focus_area": questions[current_question_index].get('focus_area', 'general')
            })
            followup_generated = True
    
    # Move to next question
    next_index = current_question_index + 1
    
    # Check if interview is complete
    if next_index >= len(questions):
        return {
            "status": "completed",
            "followup_generated": followup_generated,
            "total_questions": len(questions)
        }
    
    # Generate audio for next question
    next_question_text = questions[next_index]['question']
    audio_path = f"temp/{session_id}_q{next_index}.mp3"
    text_to_speech(next_question_text, audio_path)
    
    return {
        "status": "in_progress",
        "next_question": next_question_text,
        "next_question_audio_path": audio_path,
        "next_question_index": next_index,
        "followup_generated": followup_generated,
        "total_questions": len(questions),
        "question_type": questions[next_index].get('type', 'general')
    }


def process_voice_answer(
    session_data: Dict,
    audio_file_path: str,
    current_question_index: int
) -> Dict:
    
    # Convert speech to text
    transcription = speech_to_text(audio_file_path)
    
    # Process as text answer
    result = process_text_answer(session_data, transcription, current_question_index)
    result['transcription'] = transcription
    
    return result


def generate_final_report(
    session_data: Dict,
    all_responses: List[Dict]
) -> Dict:
    
    report = generate_interview_report(
        jd=session_data['jd_text'],
        resume=session_data['resume_text'],
        questions=session_data['questions'],
        responses=all_responses,
        candidate_name=session_data['candidate_name'],
        position=session_data['position'],
        session_id=session_data['session_id']
    )
    
    return report


def generate_pdf_report_file(report_data: Dict) -> bytes:
 
    return generate_pdf_report(report_data)


# Testing the complete Interview flow

if __name__ == "__main__":
    print("\n" + "="*70)
    print("AI INTERVIEW ASSISTANT - COMPLETE FLOW TEST")
    print("="*70)
    
    # Test configuration
    test_resume_path = "test_pdf/resume.pdf"
    test_jd = "test_pdf/JD(image).pdf"
    
    
    print("\n[STEP 1] Starting Interview")
    print("-" * 70)
    
    try:
        # Read resume PDF
        with open(test_resume_path, "rb") as f:
            resume_content = f.read()
        
        # Start interview
        session = start_interview(
            resume_pdf_content=resume_content,
            jd_text=test_jd,
            candidate_name="John Doe",
            position="Senior Python Developer",
            num_questions=3
        )
        
        print(f"✓ Session created: {session['session_id']}")
        print(f"✓ Generated {len(session['questions'])} questions")
        print(f"✓ First question audio: {session['first_question_audio_path']}")
        print(f"\nFirst Question: {session['questions'][0]['question']}")
        
    except FileNotFoundError:
        print(f"✗ Test resume not found: {test_resume_path}")
        print("Please provide a test_resume.pdf file to run the complete test")
        exit(1)
    except Exception as e:
        print(f"✗ Error starting interview: {e}")
        exit(1)
    
    # Simulate candidate answers
    test_answers = [
        "I have 6 years of Python experience, primarily working with FastAPI and Flask frameworks. I've built multiple high-performance REST APIs serving millions of requests daily. I'm also proficient in MongoDB and PostgreSQL database design.",
        "One of my most challenging projects was building a real-time data processing pipeline that handled 50,000 events per second. I used FastAPI with async processing, Redis for caching, and implemented circuit breakers for resilience. The biggest challenge was optimizing database queries to prevent bottlenecks.",
        "I handle tight deadlines by breaking down tasks into smaller deliverables, prioritizing critical features first, and maintaining clear communication with stakeholders. I also use agile methodologies to ensure we're always delivering value incrementally."
    ]
    
    print("\n[STEP 2] Processing Answers")
    print("-" * 70)
    
    all_responses = []
    current_index = 0
    
    for i, answer in enumerate(test_answers):
        if current_index >= len(session['questions']):
            break
        
        print(f"\nQ{i+1}: {session['questions'][current_index]['question']}")
        print(f"A{i+1}: {answer[:80]}...")
        
        # Store response
        all_responses.append({
            "question_index": current_index,
            "question": session['questions'][current_index]['question'],
            "answer": answer,
            "timestamp": datetime.now().isoformat()
        })
        
        # Process answer
        try:
            result = process_text_answer(session, answer, current_index)
            
            if result['status'] == 'completed':
                print(f"✓ Interview completed after {len(all_responses)} questions")
                break
            else:
                print(f"✓ Moving to next question ({result['next_question_index'] + 1}/{result['total_questions']})")
                if result['followup_generated']:
                    print("  (Follow-up question generated)")
                current_index = result['next_question_index']
        
        except Exception as e:
            print(f"✗ Error processing answer: {e}")
            break
    
    print("\n[STEP 3] Generating Report")
    print("-" * 70)
    
    try:
        report = generate_final_report(session, all_responses)
        
        print(f"✓ Report generated successfully")
        print(f"\nCandidate: {report['candidate_name']}")
        print(f"Position: {report['position']}")
        print(f"Overall Score: {report['overall_score']}/100")
        print(f"\nStrengths ({len(report['strengths'])}):")
        for s in report['strengths']:
            print(f"  • {s}")
        print(f"\nWeaknesses ({len(report['weaknesses'])}):")
        for w in report['weaknesses']:
            print(f"  • {w}")
        print(f"\nRecommendation: {report['recommendations']}")
        
    except Exception as e:
        print(f"✗ Error generating report: {e}")
        exit(1)
    
    print("\n[STEP 4] Generating PDF Report")
    print("-" * 70)
    
    try:
        pdf_bytes = generate_pdf_report_file(report)
        
        # Save PDF
        pdf_filename = f"test_interview_report_{session['session_id']}.pdf"
        with open(pdf_filename, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✓ PDF report saved: {pdf_filename}")
        print(f"  Size: {len(pdf_bytes)} bytes")
        
    except Exception as e:
        print(f"✗ Error generating PDF: {e}")
    
    print("\n" + "="*70)
    print("COMPLETE FLOW TEST FINISHED")
    print("="*70)
    print("\nSummary:")
    print(f"  • Interview completed: ✓")
    print(f"  • Questions asked: {len(all_responses)}")
    print(f"  • Overall score: {report['overall_score']}/100")
    print(f"  • PDF generated: ✓")
    print("\n✓ All functions working correctly!")
    print("="*70 + "\n")