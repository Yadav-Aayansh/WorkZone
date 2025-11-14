from typing import List, Any

from src.genai.resume_ranking.text_extractor import extract_text_from_file
from src.genai.resume_ranking.section_parser import SectionParser
from src.genai.resume_ranking.ranker import ResumeRanker
from src.genai.schemas.resume_ranking_schemas import ResumeData, RankingReport, FeedbackInformation

from src.core.storage import storage_client

def process_and_rank_resumes(
    resumes_data: List[tuple[str, str]],
    jd_direct_text: str, # Direct text
    feedback_info: FeedbackInformation,
    top_x: int = 10,
) -> RankingReport | Any:
    """
    Orchestrates the entire resume ranking process.

    Args:
        resumes_data: A list of tuples, where each tuple is (resume_id, resume_blob_name).
        jd_direct_text: The full, raw text of the job description.
        top_x: The number of candidates to shortlist.

    Returns:
        ranking_results: A RankingReport object or an error dictionary.
    """
    section_parser = SectionParser()
    ranker = ResumeRanker()
    
    parsed_resumes: list[ResumeData] = []
    print(f"Parsing {len(resumes_data)} resumes...")
    for resume_id, blob_name in resumes_data:
        try:
            blob = storage_client.bucket.blob(blob_name)
            if not blob.exists():
                print(f"Could not find {resume_id}: ({blob_name}) in GCS bucket")
                continue

            resume_bytes = blob.download_as_bytes()
            raw_text = extract_text_from_file(resume_bytes)

            sections = section_parser.parse(raw_text)
            parsed_resumes.append(
                ResumeData(
                    id=resume_id,
                    sections=sections
                )
            )

        except Exception as e:
            print(f"Could not process {resume_id} ({blob_name}): {e}")


    jd_sections = section_parser.parse(jd_direct_text)
    print("-> JD parsed into sections successfully.")

    if not parsed_resumes:
        return {"error": "No resumes could be processed."}

    ranking_results = ranker.rank_resumes(
        resumes=parsed_resumes,
        jd_sections=jd_sections,
        feedback_info = feedback_info,
        top_x=top_x,
    )
    
    return ranking_results