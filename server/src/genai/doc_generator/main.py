from src.genai.llm_client import llm_client
from src.genai.schemas.doc_generator_schemas import (
    DocumentRequest, 
    GeneratedEmail, 
    OfferLetterData, 
    RejectionLetterData, 
    PolicyUpdateData
)
from src.core.config import Config

def generate_document(request: DocumentRequest) -> GeneratedEmail:
    """
    Generates a specific HR email based on the Pydantic model provided.
    Routes to the correct generator based on 'doc_type'.
    """
    if request.doc_type == "offer_letter":
        html_content = _generate_offer_email(request)
    elif request.doc_type == "rejection_letter":
        html_content = _generate_rejection_email(request)
    elif request.doc_type == "policy_update":
        html_content = _generate_policy_update_email(request)
    else:
        # This should be impossible if Pydantic validation is working
        return GeneratedEmail(html_content="<p>Error: Invalid document type.</p>")

    if "Error:" in html_content:
        return GeneratedEmail(html_content=f"<p>{html_content}</p>")
        
    return GeneratedEmail(html_content=html_content)

def _generate_offer_email(data: OfferLetterData) -> str:
    """Generates the HTML for an offer letter."""
    
    prompt = f"""
    You are an expert HR Manager. Your task is to generate a formal, professional, and enthusiastic offer letter as an HTML email.

    **Critical Formatting Instructions:**
    - The output MUST be a single, complete HTML file.
    - Use inline CSS (style attributes) for all styling. Do NOT use <style> tags or external stylesheets.
    - Use tables for email-safe layout.
    - Use standard, web-safe fonts (e.g., Arial, Helvetica, sans-serif).
    - Do not include any text, explanation, or markdown backticks before or after the <html> tag.

    **Data to Include:**
    - Candidate Name: {data.candidate_name}
    - Company Name: {data.company_name}
    - Position: {data.position}
    - Salary: {data.salary}
    - Start Date: {data.start_date}
    - Reports to (if provided): {data.manager_name or 'N/A'}

    **Content to Generate:**
    1.  A strong, congratulatory opening.
    2.  Clear details about the position, compensation (salary), and start date.
    3.  A section on any next steps (e.g., "Please sign and return...").
    4.  A warm closing.
    5.  Sign off as "The {data.company_name} Team".
    """
    return llm_client.generate_text(prompt)

def _generate_rejection_email(data: RejectionLetterData) -> str:
    """Generates the HTML for a rejection letter."""
    
    prompt = f"""
    You are an expert HR Manager. Your task is to generate a polite, professional, and empathetic rejection letter as an HTML email.

    **Critical Formatting Instructions:**
    - The output MUST be a single, complete HTML file.
    - Use inline CSS (style attributes) for all styling. Do NOT use <style> tags or external stylesheets.
    - Use tables for email-safe layout.
    - Use standard, web-safe fonts (e.g., Arial, Helvetica, sans-serif).
    - Do not include any text, explanation, or markdown backticks before or after the <html> tag.

    **Data to Include:**
    - Candidate Name: {data.candidate_name}
    - Company Name: {data.company_name}
    - Position: {data.position}
    - Feedback (if provided): {data.feedback or 'N/A'}

    **Content to Generate:**
    1.  A polite opening that thanks the candidate for their time.
    2.  A clear (but not overly detailed) statement that they have not been selected for the {data.position} role.
    3.  A professional closing that wishes them luck in their job search.
    4.  Sign off as "The {data.company_name} Team".
    5.  **Tone:** Be empathetic, respectful, and professional.
    """
    return llm_client.generate_text(prompt)

def _generate_policy_update_email(data: PolicyUpdateData) -> str:
    """Generates the HTML for a policy update email."""
    
    prompt = f"""
    You are an expert Internal Communications Manager. Your task is to generate a clear and professional email to all employees about a policy update.

    **Critical Formatting Instructions:**
    - The output MUST be a single, complete HTML file.
    - Use inline CSS (style attributes) for all styling. Do NOT use <style> tags or external stylesheets.
    - Use tables for email-safe layout.
    - Use standard, web-safe fonts (e.g., Arial, Helvetica, sans-serif).
    - Do not include any text, explanation, or markdown backticks before or after the <html> tag.

    **Data to Include:**
    - Company Name: {data.company_name}
    - Policy Name: {data.policy_name}
    - Summary of Changes: {data.policy_changes}

    **Content to Generate:**
    1.  A clear subject line (you can put this in the body, e.g., "Subject: ...").
    2.  A brief opening to all employees ("Dear Team,").
    3.  An announcement of the update to the {data.policy_name}.
    4.  A clear presentation of the changes. Format the '{data.policy_changes}' text for maximum readability (e.g., as a bulleted list inside the HTML if it makes sense).
    5.  Information on where employees can find the full policy.
    6.  A closing from "The {data.company_name} HR Team".
    """
    return llm_client.generate_text(prompt)


# --- Test Block ---
if __name__ == '__main__':
    if not Config.GOOGLE_API_KEY:
        print("!!! Skipping Document Generator test: GOOGLE_API_KEY not found in .env file.")
    else:
        print("\n" + "="*50)
        print("     1. TESTING OFFER LETTER")
        print("="*50 + "\n")
        
        # 1. Test Offer Letter
        offer_data = OfferLetterData(
            candidate_name="Shreyas Jani",
            company_name="HRM Solutions Inc.",
            position="Senior GenAI Developer",
            salary="₹35,00,000 per annum",
            start_date="December 1, 2025"
        )
        offer_email = generate_document(offer_data)
        print(offer_email.html_content)

        print("\n" + "="*50)
        print("     2. TESTING REJECTION LETTER")
        print("="*50 + "\n")

        # 2. Test Rejection Letter
        rejection_data = RejectionLetterData(
            candidate_name="Alex Johnson",
            company_name="HRM Solutions Inc.",
            position="Junior Backend Developer",
            feedback="Not enough experience with Java"
        )
        rejection_email = generate_document(rejection_data)
        print(rejection_email.html_content)

        print("\n" + "="*50)
        print("     3. TESTING POLICY UPDATE")
        print("="*50 + "\n")

        # 3. Test Policy Update
        policy_data = PolicyUpdateData(
            policy_name="Remote Work Policy",
            policy_changes="""
- All employees are now eligible for 2 remote work days per week, effective immediately.
- A new 'Remote Work Request' form must be submitted to your manager 48 hours in advance.
- The quarterly 'In-Office Week' has been discontinued.
""",
            company_name="HRM Solutions Inc."
        )
        policy_email = generate_document(policy_data)
        print(policy_email.html_content)