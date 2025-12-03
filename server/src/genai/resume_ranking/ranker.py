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
You are an expert HR Manager. Your task is to generate a polite, professional, and **highly personalized** rejection letter as a well-designed HTML email.

**Your Goal:**
You must analyze the provided Job Description, Resume, and Scores to determine exactly *why* this candidate was rejected. You must then explain this reason to them constructively in the email. **Do not write a generic rejection.**

**Critical Formatting Instructions:**
- The output MUST be a single, complete HTML file.
- **Use inline CSS (style attributes) for all styling.** Do NOT use <style> tags.
- **Design:**
    - Background: `<body style="background-color: #f9f9f9; margin: 0; padding: 20px; font-family: Arial, sans-serif;">`
    - Container: `<table ... style="width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #dddddd; overflow: hidden;">`
    - Header: `<tr><td style="padding: 30px 40px; background-color: #004a99; color: #ffffff; font-size: 24px; font-weight: bold;">{company_name}</td></tr>`
    - Content: Main padding `style="padding: 40px;"`. Paragraphs `style="line-height: 1.6; color: #333333; margin: 15px 0;"`.
    - Footer: `<tr><td style="padding: 30px 40px; background-color: #ffffff; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center;">&copy; {company_name}</td></tr>`

**Data:**
- Candidate: {candidate_name}
- Role: {position}

**CONTEXT FOR ANALYSIS (Use this to find the specific rejection reason):**
- **Job Requirements:** {jd_qualifications}
- **Candidate Skills:** {resume_skills}
- **Candidate Experience:** {resume_experience}
- **Scores:** Keyword Match: {keyword_score:.2f} (Low is <0.4), Experience Match: {semantic_score:.2f} (Low is <0.5)
- **Matched Skills:** {matched_skills}

**Content Generation Steps:**
1.  **Analyze the Gap:** Compare the Job Requirements to the Candidate's Skills/Experience. Identify the *specific* missing skill (e.g., "Missing React") or experience gap (e.g., "Junior experience for a Senior role").
2.  **Draft the Email:**
    - Bold Greeting: "Dear {candidate_name},"
    - Thank them for applying to the {position}.
    - **The Feedback Paragraph (CRITICAL):** You MUST explain the decision based on your analysis.
        - *If missing a hard skill:* "While your background is impressive, for this specific role, we are prioritizing candidates with deeper hands-on experience in [Specific Missing Skill from Job Requirements], which is a core part of our stack."
        - *If experience mismatch:* "Although your experience in [Candidate's Field] is notable, we have decided to move forward with candidates whose recent work history is more closely aligned with [Specific Requirement from JD]."
        - *If scores are generally high but rejected:* "This was a highly competitive search. While your qualifications are strong, we have identified other candidates who have slightly more direct experience with [Specific Project/Skill mentioned in JD]."
    - Closing: Wish them success.
    - Sign-off: "Sincerely,<br>The {company_name} Team"
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
