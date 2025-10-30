from typing import List, Any

from src.genai.resume_ranking.text_extractor import extract_text_from_file
from src.genai.resume_ranking.section_parser import SectionParser
from src.genai.resume_ranking.ranker import ResumeRanker
from src.genai.schemas.resume_ranking_schemas import ResumeData, RankingReport

from src.core.storage import storage_client

def process_and_rank_resumes(
    resume_blob_names: List[str], 
    jd_blob_name: str, # PDF stored in GCS
    jd_direct_text: str, # Direct text
    top_x: int = 10
) -> RankingReport | Any:
    """
    Orchestrates the entire resume ranking process.

    Args:
        resume_paths: A list of file paths to the resumes.
        jd_path: The file path to the job description.
        top_x: The number of candidates to shortlist.

    Returns:
        ranking_results: A RankingReport object
    """
    section_parser = SectionParser()
    ranker = ResumeRanker()
    
    parsed_resumes: list[ResumeData] = []
    print(f"Parsing {len(resume_blob_names)} resumes...")
    for blob_name in resume_blob_names:
        try:
            blob = storage_client.bucket.blob(blob_name)
            if not blob.exists():
                print(f"Could not find {blob_name} in GCS bucket")
                continue

            resume_bytes = blob.download_as_bytes()
            raw_text = extract_text_from_file(resume_bytes)

            sections = section_parser.parse(raw_text)
            parsed_resumes.append(
                ResumeData(
                    id=blob_name.split('/')[-1], # Use blob name for ID
                    sections=sections
                )
            )

        except Exception as e:
            print(f"Could not process {blob_name}: {e}")
    

    jd_text = ""
    try:
        jd_blob = storage_client.bucket.blob(jd_blob_name)
        jd_bytes = jd_blob.download_as_bytes()
        jd_text = extract_text_from_file(jd_bytes)
    except Exception as e:
        return {"error": f"Could not extract text from JD at {jd_blob_name}: {e}"}

    # Full JD is the combination of pdf content and direct text
    jd_text += ("\n" + jd_direct_text)

    jd_sections = section_parser.parse(jd_text)
    print("-> JD parsed into sections successfully.")

    if not parsed_resumes:
        return {"error": "No resumes could be processed."}

    ranking_results = ranker.rank_resumes(
        resumes=parsed_resumes,
        jd_sections=jd_sections,
        top_x=top_x
    )
    
    return ranking_results
