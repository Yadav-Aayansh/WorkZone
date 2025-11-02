from src.genai.llm_client import llm_client
from src.genai.schemas.doc_generator_schemas import DocumentRequest, GeneratedDocument

def generate_document(request: DocumentRequest) -> str:

    print("Generating document...")

    try:
        final_prompt = request.prompt_template.format(data=request.data)
    except KeyError as e:
            return f"Error: Missing data for template. Required field {e} was not provided in the 'data' object."
    except Exception as e:
        return f"Error formatting prompt template: {e}"
    
    # Send the completed prompt to the AI
    generated_content = llm_client.generate_text(final_prompt)

    if not generated_content or "Error:" in generated_content:
        return f"Error: LLM failed to generate document. {generated_content}"
    
    return generated_content

if __name__ == '__main__':
    from src.core.config import Config

    if not Config.GOOGLE_API_KEY:
        print("!!! Skipping Document Generator test: GOOGLE_API_KEY not found in .env file.")
    else:
        print("--- Running Document Generator Test (Offer Letter) ---")
        
        # 1. Define the data for an offer letter
        offer_data = {
            "candidate_name": "Shreyas Jani",
            "job_title": "Senior GenAI Developer",
            "salary": "₹35,00,000 per annum",
            "start_date": "December 1, 2025",
            "manager_name": "Shreyas",
            "company_name": "HRM Solutions Inc.",
            "benefits_summary": "Comprehensive health insurance, 20 days paid leave, and remote work stipend."
        }

        # 2. Define the prompt-template (This would come from the backend)
        offer_template_string = """
You are an HR Manager at a tech company.
Your task is to generate a professional and enthusiastic offer letter in Markdown.
The tone must be: enthusiastic and professional
Use the following data to fill in all placeholders:
- Candidate Name: {data[candidate_name]}
- Job Title: {data[job_title]}
- Annual Salary: {data[salary]}
- Start Date: {data[start_date]}
- Manager Name: {data[manager_name]}
- Company Name: {data[company_name]}
- Benefits Summary: {data[benefits_summary]}

**Instructions:**
1.  Generate a complete offer letter.
2.  Do NOT invent any new information.
3.  Include a congratulatory opening.
4.  Create a section for "Position and Compensation".
5.  Create a section for "Start Date and Onboarding".
6.  Conclude with an enthusiastic closing and next steps.
7.  Sign off as "The {data[company_name]} Hiring Team".
"""
        
        # 3. Create the request object
        offer_request = DocumentRequest(
            prompt_template=offer_template_string,
            data=offer_data
        )
        
        # 4. Generate the document
        offer_document = generate_document(offer_request)
        
        print("\n" + "="*50)
        print("     GENERATED OFFER LETTER")
        print("="*50 + "\n")
        print(offer_document)

