import json
from typing import List
from src.genai.llm_client import llm_client
from src.genai.hr_interview.answer_analyzer import analyze_answer_quality
from src.genai.schemas.hr_interview_schemas import InterviewQuestion, QuestionResponse, InterviewReport, DetailedQA


def generate_interview_report(
    jd: str,
    resume: str,
    questions: List[InterviewQuestion],
    responses: List[QuestionResponse],
    candidate_name: str,
    position: str,
    session_id: str
) -> InterviewReport:
    
    # Step 1: Analyze each Q&A pair
    detailed_qa = []
    total_score = 0
    
    for i, resp in enumerate(responses):
        analysis = analyze_answer_quality(
            questions[i].question,
            resp.answer,
            questions[i].focus_area
        )
        
        detailed_qa.append(DetailedQA(
            question=questions[i].question,
            answer=resp.answer,
            score=analysis.score,
            strength=analysis.strength,
            weakness=analysis.weakness
        ))
        total_score += analysis.score
    
    # Step 2: Calculate overall score
    avg_score = total_score / len(responses) if responses else 0
    overall_score = (avg_score / 10) * 100  # Convert to 0-100 scale
    
    # Step 3: Compile Q&A summary
    qa_summary = "\n\n".join([
        f"Q{i+1}: {questions[i].question}\nA{i+1} (Score: {detailed_qa[i].score}/10): {responses[i].answer}"
        for i in range(len(responses))
    ])
    
    # Step 4: Generate comprehensive analysis
    prompt = f"""Create a BRUTALLY HONEST hiring evaluation report based on actual performance.

Position: {position}
Candidate: {candidate_name}
Calculated Overall Score: {overall_score:.1f}/100 (based on answer quality)

Job Description: {jd}
Resume: {resume}

Interview Q&A with Individual Scores:
{qa_summary}

CRITICAL INSTRUCTIONS - BE HONEST:
1. If overall score is below 40: Candidate is NOT suitable - be clear about this
2. If answers were "I don't know" or vague: List this as MAJOR weakness
3. Strengths: Only list if there are actual strengths shown in answers
4. Weaknesses: Be specific about what was lacking in their answers
5. Technical Fit: If they couldn't answer technical questions, say so directly
6. Communication: If answers were brief/unclear, mention this
7. Recommendation: 
   - Score 70+: "Recommend for hire"
   - Score 50-69: "Consider with reservations" 
   - Score <50: "Do not recommend"

Provide HONEST assessment:
1. Top 3 Strengths (if not apparent then mention only one strength else more than one)
2. Top 3 Weaknesses (be specific about poor answers)
3. Technical Fit (2-3 sentences, honest assessment)
4. Communication Skills (2-3 sentences, honest assessment)
5. Recommendation (hire/consider/reject with HONEST reason based on scores)

Return JSON:
{{
  "strengths": ["actual strength 1", "actual strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "technical_fit": "honest technical assessment",
  "communication_assessment": "honest communication assessment",
  "recommendations": "honest hiring recommendation with reason"
}}"""

    messages = [
        {
            "role": "system",
            "content": "You are an HONEST HR analyst who provides truthful evaluations based on actual performance. Don't sugarcoat poor performance. Return only JSON."
        },
        {"role": "user", "content": prompt}
    ]
    
    try:
        response = llm_client.call_llm(messages, temperature=0.3)
        start = response.find('{')
        end = response.rfind('}') + 1
        report_data = json.loads(response[start:end])
        
        return InterviewReport(
            session_id=session_id,
            candidate_name=candidate_name,
            position=position,
            overall_score=round(overall_score, 1),
            strengths=report_data.get('strengths', ["Completed the interview"]),
            weaknesses=report_data.get('weaknesses', ["Needs improvement in responses"]),
            technical_fit=report_data.get('technical_fit', 'Requires further evaluation'),
            communication_assessment=report_data.get('communication_assessment', 'Requires further evaluation'),
            recommendations=report_data.get('recommendations', 'Manual review recommended'),
            detailed_qa=detailed_qa
        )
    
    except Exception as e:
        print(f"Report generation error: {e}")
        return InterviewReport(
            session_id=session_id,
            candidate_name=candidate_name,
            position=position,
            overall_score=round(overall_score, 1),
            strengths=["Completed the interview"],
            weaknesses=["Unable to generate detailed analysis"],
            technical_fit="Requires further evaluation",
            communication_assessment="Requires further evaluation",
            recommendations=f"Manual review recommended. Calculated score: {overall_score:.1f}/100",
            detailed_qa=detailed_qa
        )


# Testing the module

if __name__ == "__main__":
    print("Testing Report Generator Module (Pydantic)")
    print("=" * 60)
    
    # Test data
    test_jd = "Python Developer with FastAPI and MongoDB experience"
    test_resume = "John Doe - 5 years Python, FastAPI expert"
    test_questions = [
        InterviewQuestion(question="What is your Python experience?", type="technical", focus_area="technical"),
        InterviewQuestion(question="Tell me about a challenging project.", type="experience", focus_area="experience"),
        InterviewQuestion(question="How do you handle deadlines?", type="behavioral", focus_area="soft_skills")
    ]
    test_responses = [
        QuestionResponse(question_index=0, question=test_questions[0].question, answer="I have 5 years of Python experience, specializing in FastAPI and web development.", timestamp="2025-01-01T10:00:00"),
        QuestionResponse(question_index=1, question=test_questions[1].question, answer="I built a complex API system that handled 10k requests/sec with caching.", timestamp="2025-01-01T10:02:00"),
        QuestionResponse(question_index=2, question=test_questions[2].question, answer="I prioritize tasks and communicate clearly with my team.", timestamp="2025-01-01T10:04:00")
    ]
    
    try:
        report = generate_interview_report(
            jd=test_jd,
            resume=test_resume,
            questions=test_questions,
            responses=test_responses,
            candidate_name="John Doe",
            position="Python Developer",
            session_id="test_123"
        )
        
        print("\n✓ Report Generated Successfully (Pydantic Validated)\n")
        print(f"Type: {type(report).__name__}")
        print(f"Overall Score: {report.overall_score}/100")
        print(f"\nStrengths ({len(report.strengths)}):")
        for s in report.strengths:
            print(f"  • {s}")
        print(f"\nWeaknesses ({len(report.weaknesses)}):")
        for w in report.weaknesses:
            print(f"  • {w}")
        print(f"\nTechnical Fit: {report.technical_fit}")
        print(f"\nCommunication: {report.communication_assessment}")
        print(f"\nRecommendation: {report.recommendations}")
        print(f"\nDetailed Q&A: {len(report.detailed_qa)} questions analyzed")
        
    except Exception as e:
        print(f"✗ Error: {e}")
