import re
from typing import Dict, List, Set
import numpy as np

from src.genai.resume_ranking.keyword_extractor import SpacyKeywordExtractor
from src.genai.schemas.resume_ranking_schemas import (
    FeedbackInformation,
    ResumeData,
    ScoringDetails,
    RankedCandidate,
    RankingReport,
)
from src.genai.llm_client import llm_client


REJECTION_EMAIL_FROM_ANALYSIS_PROMPT = """
You are an expert HR Manager. Your task is to generate a polite, professional, and **highly personalized** rejection letter using the strict HTML template provided below.

**Your Goal:**
1. Analyze the provided Job Description, Resume, and Scores to determine specific areas for improvement.
2. Generate specific, constructive feedback points explaining exactly what the candidate lacks compared to the job requirements.
3. Output the **Complete HTML** string below, inserting your generated feedback points into the unordered list (`<ul>`) section.

**Context for Analysis:**
- **Job Requirements:** {jd_qualifications}, {jd_responsibilities}
- **Candidate Skills:** {resume_skills}
- **Candidate Experience:** {resume_experience}
- **Scores:** Keyword Match: {keyword_score:.2f} (Low <0.4), Experience Match: {semantic_score:.2f} (Low <0.5)
- **Matched Skills:** {matched_skills}

**Instructions for Feedback Generation:**
- Identify the specific gap (e.g., "Lack of React experience", "Not enough years in management").
- Generate 2-3 constructive bullet points wrapped in `<li>` tags.
- Example: `<li>Improve your project experience in React and modern UI frameworks.</li><li>Gain more hands-on experience with [Missing Skill].</li>`

**Output Template (Strictly adhere to this HTML):**

<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>Application Update</title>
<style>
  :root{{--page-bg:#f3e8fb;--card-bg:#ffffff;--accent:#8b5cf6;--text:#0f172a;--muted:#6b7280;}}
  body{{margin:0;background:var(--page-bg);font-family:Arial,Helvetica,sans-serif;color:var(--text);}}
  .wrap{{max-width:680px;margin:28px auto;padding:16px;}}
  .card{{background:var(--card-bg);border-radius:12px;padding:24px;box-shadow:0 6px 22px rgba(15,23,42,0.06);}}
  .header{{display:flex;align-items:center;gap:12px;margin-bottom:10px;}}
  .logo{{width:44px;height:44px;object-fit:contain;border-radius:6px;}}
  .brand{{font-weight:700;color:var(--text);font-size:18px;}}
  h1{{font-size:20px;margin:6px 0 10px;color:var(--text);}}
  p{{color:var(--text);line-height:1.6;}}
  .note{{background:#fff5f7;border-left:4px solid #f43f5e;padding:12px;border-radius:6px;color:#7a2b2b;margin:14px 0;}}
  .feedback-box{{background:#f8f5ff;border-left:4px solid var(--accent);padding:14px;border-radius:6px;margin-top:16px;}}
  .footer{{text-align:center;color:var(--muted);font-size:13px;margin-top:18px;}}
  a{{color:var(--accent)}}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">{company_name}</div>
    </div>

    <h1>Application Status Update</h1>

    <p>Hi {candidate_name},</p>

    <p>Thank you for applying for the <strong>{position}</strong> role at <strong>{company_name}</strong>. We appreciate the time and effort you invested in the hiring process.</p>

    <div class="note">
      <strong>Update:</strong> After reviewing your application, we are unable to move forward at this time.
    </div>

    <p>We want to help you grow and become a stronger fit for similar opportunities in the future. Below is a detailed personalized feedback summary based on your application.</p>

    <!-- Detailed Feedback Section -->
    <div class="feedback-box">
      <strong>How to become a stronger fit for this role:</strong>
      <ul>
        <!-- INSERT GENERATED FEEDBACK POINTS (<li>...</li>) HERE -->
      </ul>
    </div>

    <p style="margin-top:18px;">We encourage you to continue developing your skills and apply again when you feel ready. If you have any questions, you can reply to this email or contact our HR team.</p>

    <p>Warm regards,<br>The {company_name} Hiring Team</p>

    <div class="footer">© 2025 {company_name}</div>

  </div>
</div>
</body>
</html>
"""

SHORTLISTED_FEEDBACK_PROMPT_TEMPLATE = """
You are a senior technical recruiter providing a concise analysis for a hiring manager.
Your task is to generate a brief, professional feedback summary (2-3 bullet points) for a **shortlisted** candidate.
Write your response directly starting with the feedback with nothing other than the feedback.

**Job Description (Key Information):**
- Responsibilities: {jd_responsibilities}
- Qualifications: {jd_qualifications}

**Candidate's Resume (Key Information):**
- Experience: {resume_experience}
- Skills: {resume_skills}

**Automated Analysis:**
- Keyword Match Score: {keyword_score:.2f}
- Experience Similarity Score: {semantic_score:.2f}
- Matched Skills: {matched_skills}

**Instructions:**
Based on all the information, provide a feedback summary. Focus on their key strengths and alignment with the role.
Keep the feedback concise and professional. Do not repeat the scores.
"""

class ResumeRanker:
    def __init__(self):
        self.keyword_extractor = SpacyKeywordExtractor()

        self.weights = {"keyword": 0.3, "semantic": 0.7}

        self.jd_keywords = []
        self.jd_embedding = None

    def _get_embedding(self, text: str):
        return llm_client.generate_embedding(text)

    def _get_llm_feedback(
        self,
        candidate_data: RankedCandidate,
        jd_sections: Dict[str, str],
        resume_sections: Dict[str, str],
        is_shortlisted: bool,
        feedback_info: FeedbackInformation
    ) -> str:

        """
        Generates LLM output.
        - Shortlisted: Returns an internal feedback summary (str).
        - Rejected: Returns a full rejection email (html str).
        """
        if not llm_client.text_model:
            return "Feedback generation disabled: LLM not configured."

        if is_shortlisted:
            # --- SHORTLISTED: Generate internal feedback summary ---
            prompt = SHORTLISTED_FEEDBACK_PROMPT_TEMPLATE.format(
                jd_responsibilities=jd_sections.get("responsibilities", "N/A"),
                jd_qualifications=jd_sections.get("qualifications", "N/A"),
                resume_experience=resume_sections.get("experience", "N/A"),
                resume_skills=resume_sections.get("skills", "N/A"),
                keyword_score=candidate_data.details.keyword_score,
                semantic_score=candidate_data.details.semantic_score,
                matched_skills=", ".join(candidate_data.details.matched_keywords)
            )
            feedback_summary = llm_client.generate_text(prompt)
            return feedback_summary # This is just the internal feedback string

        else:
            # --- REJECTED: Generate full HTML rejection email from analysis ---
            
            # Now, build the email prompt (1 API call)
            prompt = REJECTION_EMAIL_FROM_ANALYSIS_PROMPT.format(
                # Data for the email
                candidate_name=candidate_data.candidate_name,
                company_name=feedback_info.company_name,
                position=feedback_info.position,
                
                # Context for analysis
                jd_responsibilities=jd_sections.get("responsibilities", "N/A"),
                jd_qualifications=jd_sections.get("qualifications", "N/A"),
                resume_experience=resume_sections.get("experience", "N/A"),
                resume_skills=resume_sections.get("skills", "N/A"),
                keyword_score=candidate_data.details.keyword_score,
                semantic_score=candidate_data.details.semantic_score,
                matched_skills=", ".join(candidate_data.details.matched_keywords)
            )
            return llm_client.generate_text(prompt)

    def _prepare_jd(self, jd_sections: Dict[str, str]):
        print("--- Processing Job Description Sections---")

        relevant_text = " ".join(
            [
                jd_sections.get("responsibilities", ""),
                jd_sections.get("qualifications", ""),
                jd_sections.get("requirements", ""),
                jd_sections.get("skills", ""),
            ]
        )

        if not relevant_text.strip():
            relevant_text = " ".join(jd_sections.values())

        self.jd_keywords = self.keyword_extractor.extract(relevant_text)
        print(
            f"-> Extracted {len(self.jd_keywords)} keywords from relevant JD sections."
        )

        self.jd_embedding = self._get_embedding(relevant_text)
        if self.jd_embedding:
            print("-> Generated JD embedding successfully.")

    def _score_single_resume(self, resume_data: ResumeData) -> RankedCandidate:
        resume_sections = resume_data.sections

        # Keyword Score
        text_to_search = (
            resume_sections.get("skills", "")
            + " "
            + resume_sections.get("experience", "")
        ).lower()

        matched_keywords: Set[str] = set()
        if self.jd_keywords:
            for keyword in self.jd_keywords:
                pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
                if re.search(pattern, text_to_search):
                    matched_keywords.add(keyword)
            keyword_score = len(matched_keywords) / len(self.jd_keywords)
        else:
            keyword_score = 0

        # Semantic score
        semantic_score = 0.0
        resume_experience_text = resume_sections.get("experience", "")
        if self.jd_embedding and resume_experience_text:
            resume_embedding = self._get_embedding(resume_experience_text)
            if resume_embedding:
                # Calculate cosine similarity
                semantic_score = np.dot(self.jd_embedding, resume_embedding)

        # Final weighted score
        final_score = (self.weights["keyword"] * keyword_score) + (
            self.weights["semantic"] * semantic_score
        )

        scoring_details = ScoringDetails(
            keyword_score=keyword_score,
            semantic_score=semantic_score,
            matched_keywords=sorted(list(matched_keywords)),
            keyword_match_count=f"{len(matched_keywords)}/{len(self.jd_keywords)}",
        )

        return RankedCandidate(
            application_id=resume_data.id,
            candidate_name=resume_data.candidate_name,
            final_score=final_score,
            details=scoring_details,
        )

    def rank_resumes(
        self, resumes: List[ResumeData], jd_sections: Dict[str, str], feedback_info: FeedbackInformation, top_x: int = 10
    ) -> RankingReport:
        self._prepare_jd(jd_sections)

        # Create a map of resume_id to its full section data for later use
        resume_sections_map = {res.id: res.sections for res in resumes}

        print(f"Scoring {len(resumes)} resumes...")
        scored_resumes = [self._score_single_resume(res) for res in resumes]
        scored_resumes.sort(key=lambda x: x.final_score, reverse=True)

        # Split into shortlisted and rejected lists
        shortlisted = scored_resumes[:top_x]
        rejected = scored_resumes[top_x:]

        print("Generating LLM-powered feedback for all candidates...")
        for candidate in shortlisted:
            candidate_sections = resume_sections_map[candidate.application_id]
            candidate.feedback = self._get_llm_feedback(
                candidate, jd_sections, candidate_sections, is_shortlisted=True, feedback_info=feedback_info
            )

        for candidate in rejected:
            candidate_sections = resume_sections_map[candidate.application_id]
            candidate.feedback = self._get_llm_feedback(
                candidate, jd_sections, candidate_sections, is_shortlisted=False, feedback_info=feedback_info
            )

        return RankingReport(
            shortlisted_candidates=shortlisted, rejected_candidates=rejected
        )
