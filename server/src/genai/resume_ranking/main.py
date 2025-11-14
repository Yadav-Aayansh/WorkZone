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

if __name__ == "__main__":

    GCS_RESUME_BLOB_NAMES = [
        ("1", "Shreyas_Jani_Resume_Sept2025.pdf"),
        ("2", "Shreyas_Jani_Resume_June_2025.pdf"),
        ("3", "Shreyas - 22f3001229 - IITM BS.pdf"),
        ("4", "Shreyas_Jani_CV_11Feb.pdf"),
    ]

    results = process_and_rank_resumes(
        resumes_data=GCS_RESUME_BLOB_NAMES,
        jd_direct_text="""ation together to solve intractable conservation
 challenges.
 About Us
 SafetyNet Technologies (SNTech) takes a user-centred design approach to building smart
 solutions to overfishing and ocean conservation, backed by sound business models that
 help make the commercial fishing industry smarter and less wasteful. Based in Somerset
 House, we are a team of 10 designers, engineers, scientists and business specialists who
 have built strong links with the international commercial fishing industry, scientific
 community and regulatory bodies. There are solutions to the global overfishing problem
 and weaim to accelerate their discovery to enable maximum positive impact.
 Whyare welooking for you?
 We’ve created an underwater camera that can make a real difference to sustainable fishing
 and biodiversity monitoring. Camera footage is viewed by fishing crews and scientists to
 improve their sustainability outcomes and track species behaviour. We are looking for a
 computer vision engineer to work with us to create computer vision pipelines that can help
 our users navigate overwhelming quantities of video data to find the insights they need.
 Weneedyouto help us identify and explore a variety of computer vision techniques with
 our library of subsea footage. We are designing with extreme users in an extreme
environment, so you will be inventive, empathetic and work collaboratively with our team
 whohave brought our existing marine products to market.
 What is the job?
 Weneedyouto research, evaluate and implement a variety of computer vision approaches
 (both statistical and ML-based) for analysing large volumes of video data for features of
 interest that we have identified. We have a large volume of training and validation video
 data to work with, and hired help for labelling and cleaning this dataset. You will also be
 working with a full stack developer who is responsible for wrapping your work in a user
 interface that non-experts can use. Expect a real emphasis on computational efficiency.
 Whilst at sea where our products are used, there is rarely an internet connection to rely on
 cloud computing. We expect our models to be run locally, at the edge.
 Weneedyouto define an overall approach and architecture with us, then build pipelines
 that are testable and scalable to our needs. You will be implementing a build system to
 release code that is easy to update and maintainable. You will work closely with the
 product manager and full stack developer to identify priorities, schedule work and
 implement effective CV approaches, and a Video Annotator to be given great training
 datasets.
 Responsibilities:
 This is an engineering position, with a focus on computer vision and machine learning:
 ● Supportthe entire application lifecycle (concept, design, test, release, support).
 ● Giveadvice to other members of the team, especially concerning video data labelling.
 ● Writing code to produce fully functional computer vision pipelines and interface APIs.
 ● Troubleshoot, test and debug.
 Skills:
 Technical skills:
 ● Prior work with computer vision workflows for digitisation, counting and
 identification (for example object detection, segmentation and/or captioning).
 ● Experience in training, tuning, and implementing computer vision models.
 ● Proficiency in one or more programming languages that can be used to support the
 job’s responsibilities (e.g. Python/Jupyter, Java, Scala) and skills in SQL, Docker,
 Google Colab. Proven ability to write maintainable code.
 ● Workingunderstanding of Deep Learning frameworks such as PyTorch, Tensorflow.
 ● Experience of working with image composite and stitching related software.
 ● Experience of using object detection algorithms, models and frameworks.
 ● Demonstrable portfolio of previous relevant work, illustrating the above.
 Collaborative skills:
 ● Demonstrable skill in communicating effectively- you are able to represent the
 opportunities and challenges of CV/ML development, whilst recognising the
 concerns and priorities of other disciplines (software development, project
 management etc.)
 ● Writing and being steered by user requirements, technical specifications, testing and
 quality considerations.
 ● Written skills to document your work, and verbal skills to engage with external
 parties.
● Ability to break down a complex task into smaller components and easily fit them
 back again into a bigger picture.
 Location
 You will be working either remotely or from our physical studio in Somerset House, London,
 UK, where you’ll find our workspace, engineering workshops, and kitchen. You are also
 welcome to apply to this role as a fully remote applicant, with the expectation to visit the
 studio once every month for check-in meetings.
 Extras
 ● MakeaBIGsocial/environmental impact using your skills in an exciting startup
 ● 10daysholiday plus bank holidays.
 ● Healthinsurance and Cashback plan available
 ● Flexible working options (both location and times of day)
 ● Cycletowork scheme
 ● Sustainable holiday travel incentives
 ● Mentalhealth first aiders across the company
 ● Wearecurrently trialling a 4.5 day working week (ie. everyone has Friday afternoon
 off work except for emergencies) without loss of pay.
 To Apply
 Send CV, cover letter and work examples to enquiries@sntech.co.uk with subject
 ‘[SEAFRAME] Computer Vision Engineer (5 month contract) Application’.
 Equal opportunities
 SafetyNet Technologies Ltd. (SNTech) is an equal opportunities employer, we recruit
 regardless of race, religion, gender, gender identity, sexual orientation, age or disability
 status and look to employ from a wide range of backgrounds and experiences.
 Studies show that women do not apply for roles unless they meet 100% of the
 requirements, whereas men apply when they meet at least 60% of the requirements. So
 regardless of how you identify, please apply if this is a role that would make you excited to
 come in or log in to work every day.
 To help us reduce bias, please do not include a photo in your CV or application.
 Wehopeyou consider joining us""",
        top_x=2,
        feedback_info=FeedbackInformation(candidate_name="Shreyas Jani", company_name="SafetyNet", position="CV Engineer")
    )


    print("FINAL RANKING REPORT")
    print(results.model_dump_json(indent=2))