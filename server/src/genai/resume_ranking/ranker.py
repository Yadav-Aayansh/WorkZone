import re
from typing import Dict, List, Set
import numpy as np

from src.genai.resume_ranking.keyword_extractor import SpacyKeywordExtractor
from src.genai.resume_ranking.section_parser import SectionParser
from src.genai.schemas.resume_ranking_schemas import (
    ResumeData,
    ScoringDetails,
    RankedCandidate,
    RankingReport,
)
from src.genai.llm_client import llm_client



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
    ) -> str:

        status = "Shortlisted" if is_shortlisted else "Rejected"

        prompt = f"""
        You are a senior technical recruiter providing a concise analysis of a resume for a hiring manager.
        Your task is to generate a brief, professional feedback summary (2-3 bullet points) for a candidate who has been automatically scored and marked as '{status}'.
        Write your response directly starting with the feedback with nothing other than the feedback

        **Job Description (Key Information):**
        - Responsibilities: {jd_sections.get("responsibilities", "N/A")}
        - Qualifications: {jd_sections.get("qualifications", "N/A")}

        **Candidate's Resume (Key Information):**
        - Experience: {resume_sections.get("experience", "N/A")}
        - Skills: {resume_sections.get("skills", "N/A")}

        **Automated Analysis:**
        - Keyword Match Score: {candidate_data.details.keyword_score:.2f} (out of 1.0)
        - Experience Similarity Score: {candidate_data.details.semantic_score:.2f} (out of 1.0)
        - Matched Skills: {", ".join(candidate_data.details.matched_keywords)}

        **Your Instructions:**
        Based on all the information above, provide a feedback summary.
        - If '{status}' is 'Shortlisted', focus on their key strengths and alignment with the role.
        - If '{status}' is 'Rejected', focus constructively on the primary gaps or misalignments.
        - Keep the feedback concise and professional. Do not repeat the scores.
        """

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
            final_score=final_score,
            details=scoring_details,
        )

    def rank_resumes(
        self, resumes: List[ResumeData], jd_sections: Dict[str, str], top_x: int = 10
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
                candidate, jd_sections, candidate_sections, is_shortlisted=True
            )

        for candidate in rejected:
            candidate_sections = resume_sections_map[candidate.application_id]
            candidate.feedback = self._get_llm_feedback(
                candidate, jd_sections, candidate_sections, is_shortlisted=False
            )

        return RankingReport(
            shortlisted_candidates=shortlisted, rejected_candidates=rejected
        )
