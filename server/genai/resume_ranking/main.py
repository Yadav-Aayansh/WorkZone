from typing import List, Dict

from .text_extractor import extract_text_from_file
from .section_parser import SectionParser
from .ranker import ResumeRanker

def process_and_rank_resumes(
    resume_paths: List[str], 
    jd_path: str, 
    top_x: int = 10
) -> Dict[str, List]:
    """
    Orchestrates the entire resume ranking process.

    Args:
        resume_paths: A list of file paths to the resumes.
        jd_path: The file path to the job description.
        top_x: The number of candidates to shortlist.

    Returns:
        A dictionary with the final ranking report.
    """
    section_parser = SectionParser()
    ranker = ResumeRanker()
    
    parsed_resumes = []
    print(f"Parsing {len(resume_paths)} resumes...")
    for path in resume_paths:
        try:
            raw_text = extract_text_from_file(path)
            sections = section_parser.parse(raw_text)
            parsed_resumes.append({
                'id': path.split('/')[-1],
                'sections': sections
            })
        except Exception as e:
            print(f"Could not process {path}: {e}")
    
    jd_text = extract_text_from_file(jd_path)
    if not jd_text.strip():
        return {"error": f"Could not extract text from Job Description at {jd_path}."}

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

if __name__ == '__main__':
    
    import os
    import shutil
    import json
    
    JD_PATH = r"D:\Shreyas\Resumes\JDs\CV_engineer JD.pdf"

    LOCAL_RESUME_PATHS = [
        r"D:\Shreyas\Resumes\Shreyas_Jani_Resume_Sept2025.pdf",
        r"D:\Shreyas\Resumes\Shreyas_Jani_Resume_June_2025.pdf",
    ]

    results = process_and_rank_resumes(
            resume_paths=LOCAL_RESUME_PATHS,
            jd_path=JD_PATH, 
            top_x=2
        )

    print("FINAL RANKING REPORT")
    print(json.dumps(results, indent=2))