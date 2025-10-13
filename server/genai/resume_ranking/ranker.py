import os
import re
from typing import Dict, List, Any
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

from .keyword_extractor import SpacyKeywordExtractor
from .section_parser import SectionParser 

load_dotenv("genai/.env")

# Google API key setup
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except TypeError:
    print("!!! WARNING: GOOGLE_API_KEY environment variable not set. Semantic scoring will be disabled.")
    genai = None

class ResumeRanker:
    """
    Ranks a batch of resumes against a single job description.
    """
    def __init__(self):
        self.keyword_extractor = SpacyKeywordExtractor()
        
        self.weights = {'keyword': 0.3, 'semantic': 0.7} 
        
        self.jd_keywords = []
        self.jd_embedding = None

    def _get_embedding(self, text: str):
        """Generates embedding for a given text using Google's model."""
        if not genai or not text.strip():
            return None
        try:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="RETRIEVAL_DOCUMENT" # Optimized for document retrieval
            )
            return result['embedding']
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None

    def _prepare_jd(self, jd_sections: Dict[str, str]):
        """
        Processes the parsed JD sections to extract keywords from relevant parts.
        
        Args:
            jd_sections: A dictionary of parsed sections from the job description.
        """
        print("--- Processing Job Description Sections---")
        
        relevant_text = " ".join([
            jd_sections.get('responsibilities', ''),
            jd_sections.get('qualifications', ''),
            jd_sections.get('requirements', ''),
            jd_sections.get('skills', '')
        ])

        if not relevant_text.strip():
            relevant_text = " ".join(jd_sections.values())

        self.jd_keywords = self.keyword_extractor.extract(relevant_text)
        print(f"-> Extracted {len(self.jd_keywords)} keywords from relevant JD sections.")
        
        self.jd_embedding = self._get_embedding(relevant_text)
        if self.jd_embedding:
            print("-> Generated JD embedding successfully.")

    def _score_single_resume(self, resume_id: str, resume_sections: Dict[str, str]) -> Dict[str, Any]:
        """Calculates all score components for a single resume."""
        
        # Keyword Score
        text_to_search = (resume_sections.get('skills', '') + ' ' + 
                          resume_sections.get('experience', '')).lower()
        
        matched_keywords = set()
        if self.jd_keywords:
            for keyword in self.jd_keywords:
                pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
                if re.search(pattern, text_to_search):
                    matched_keywords.add(keyword)
            keyword_score = len(matched_keywords) / len(self.jd_keywords)
        else:
            keyword_score = 0

        # Semantic score
        semantic_score = 0.0
        resume_experience_text = resume_sections.get('experience', '')
        if self.jd_embedding and resume_experience_text:
            resume_embedding = self._get_embedding(resume_experience_text)
            if resume_embedding:
                # Calculate cosine similarity
                semantic_score = np.dot(self.jd_embedding, resume_embedding)
        
        # Final weighted score
        final_score = (self.weights['keyword'] * keyword_score) + \
                      (self.weights['semantic'] * semantic_score)

        return {
            'resume_id': resume_id,
            'final_score': round(final_score, 4),
            'details': {
                'keyword_score': round(keyword_score, 4),
                'matched_keywords': list(matched_keywords),
                'keyword_match_count': f"{len(matched_keywords)}/{len(self.jd_keywords)}",
                'semantic_score': semantic_score
            }
        }

    def rank_resumes(self, resumes: List[Dict[str, str]], jd_sections: Dict[str, str], top_x: int = 10) -> Dict[str, List]:
        """
        Takes a list of resumes, ranks them against a parsed JD, and returns the top X.

        Args:
            resumes: A list of resume dictionaries, each with 'id' and 'sections'.
            jd_sections: The parsed sections of the job description as a dictionary.
            top_x: The number of top candidates to return.

        Returns:
            A dictionary containing 'shortlisted' and 'rejected' candidates.
        """
        self._prepare_jd(jd_sections)
        
        print(f"Scoring {len(resumes)} resumes...")
        scored_resumes = []
        for resume in resumes:
            # resume is expected to be a dict like {'id': 'resume1.pdf', 'sections': {...}}
            score_data = self._score_single_resume(resume['id'], resume['sections'])
            scored_resumes.append(score_data)
        
        # Sort candidates by final_score in descending order
        scored_resumes.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Split into shortlisted and rejected lists
        shortlisted = scored_resumes[:top_x]
        rejected = scored_resumes[top_x:]

        for candidate in rejected:
            if candidate['details']['keyword_score'] < 0.2: # temp threshold
                candidate['rejection_reason'] = "Very low match on key skills."
            else:
                candidate['rejection_reason'] = "Does not meet overall requirements compared to other candidates."
        
        return {
            "shortlisted_candidates": shortlisted,
            "rejected_candidates": rejected
        }

if __name__ == '__main__':
    # Sample Data
    sample_resumes = [
        {
            'id': 'candidate_A_strong.pdf',
            'sections': {
                'skills': 'Python, Django, PostgreSQL, RESTful APIs, Docker, AWS',
                'experience': '5 years developing with Python and Django on AWS.'
            }
        },
        {
            'id': 'candidate_B_frontend.pdf',
            'sections': {
                'skills': 'React, JavaScript, HTML, CSS',
                'experience': 'Focused on front-end development with React.'
            }
        },
        {
            'id': 'candidate_C_junior_python.pdf',
            'sections': {
                'skills': 'Python, Flask, SQL',
                'experience': '1 year of experience building small apps with Python.'
            }
        }
    ]

    sample_jd_text = """
    We are seeking a Senior Backend Engineer with experience in Python and Django.
    Responsibilities include designing RESTful APIs, working with PostgreSQL,
    and deploying services on AWS. Experience with Docker is a plus.
    """

    # Execution
    section_parser = SectionParser()
    sample_jd_sections = section_parser.parse(sample_jd_text)

    ranker = ResumeRanker()
    ranking_results = ranker.rank_resumes(sample_resumes, sample_jd_sections, top_x=2)

    import json
    print("\n")
    print("FINAL RANKING REPORT")
    print(json.dumps(ranking_results, indent=2))