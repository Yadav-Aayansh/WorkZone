from typing import List, Any

from src.genai.utils.download_blob import download_blob
from src.genai.utils.text_extractor import extract_text_from_file
from src.genai.resume_ranking.section_parser import SectionParser
from src.genai.resume_ranking.ranker import ResumeRanker
from src.genai.schemas.resume_ranking_schemas import ResumeData, RankingReport, FeedbackInformation

def process_and_rank_resumes(
    resumes_data: List[tuple[str, str, str]],
    jd_direct_text: str, # Direct text
    feedback_info: FeedbackInformation,
    top_x: int = 10,
) -> RankingReport | Any:
    """
    Orchestrates the entire resume ranking process.

    Args:
        resumes_data: A list of tuples, where each tuple is (resume_id, candidate_name, resume_blob_name).
        jd_direct_text: The full, raw text of the job description.
        top_x: The number of candidates to shortlist.

    Returns:
        ranking_results: A RankingReport object or an error dictionary.
    """
    section_parser = SectionParser()
    ranker = ResumeRanker()
    
    parsed_resumes: list[ResumeData] = []
    print(f"Parsing {len(resumes_data)} resumes...")
    for resume_id, candidate_name, blob_name in resumes_data:
        try:
            raw_text = extract_text_from_file(download_blob(blob_name=blob_name))

            sections = section_parser.parse(raw_text)
            parsed_resumes.append(
                ResumeData(
                    id=resume_id,
                    candidate_name=candidate_name,
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


if __name__ == '__main__':


    GCS_RESUME_BLOB_NAMES = [
        ("1","Shreyas","Shreyas_Jani_Resume_Sept2025.pdf"),
        ("2","Jani","Shreyas_Jani_Resume_June_2025.pdf"),
        ("3","Name","Shreyas - 22f3001229 - IITM BS.pdf"),
        ("4","Another Name","Shreyas_Jani_CV_11Feb.pdf"),
    ]

    results = process_and_rank_resumes(
        resumes_data=GCS_RESUME_BLOB_NAMES,
        jd_direct_text="Assume standard Python dev job at google",
        top_x=2,
        feedback_info=FeedbackInformation(company_name="Google", position="Python Developer")
    )


    print("FINAL RANKING REPORT")
    print(results.model_dump_json(indent=2))