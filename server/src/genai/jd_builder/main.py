from src.genai.llm_client import llm_client
from src.genai.schemas.jd_builder_schemas import JDBuilderPrompt, GeneratedJD

_SYSTEM_PROMPT = """
You are an expert Senior Technical Recruiter and HR Copywriter.
Your task is to expand a simple user prompt into a complete, professional, and comprehensive job description (JD).

The user will provide a short prompt. You will generate a full JD in Markdown format.

**RULES:**
1.  **Output Format:** The output MUST be a single, clean Markdown block.
2.  **Professional Tone:** The tone should be {tone}.
3.  **Inclusive Language:** Use clear, professional, and inclusive language. Avoid all corporate jargon, clichés, or biased terms ('rockstar', 'ninja', 'hacker', 'work hard play hard').
4.  **Infer Details:** Infer logical responsibilities and skills based on the user's prompt. For example, a "Senior Python Developer" likely needs "mentoring junior developers," "code reviews," and "architectural design."
5.  **Placeholders:** Use placeholders for company-specific info, like `[Company Name]` (or the one provided), `[About Us section]`, and `[benefits details]`.

**REQUIRED SECTIONS (in this order):**
- `# [Job Title]`
- `## Job Summary` (A brief, engaging overview of the role)
- `## Key Responsibilities` (A bulleted list)
- `## Required Qualifications (Must-Haves)` (A bulleted list of essential skills)
- `## Preferred Qualifications (Nice-to-Haves)` (A bulleted list of non-essential skills)
- `## Benefits`
    - `[Provide a brief list of key benefits, e.g., Health insurance, 401(k), Remote work options. Link to a full benefits page if available.]`
- `## About {company_name}`
    - `[This is a placeholder for the company boilerplate. Describe the company's mission and culture.]`
- `## Diversity, Equity, and Inclusion Statement`
    - `[Insert the company's standard DEI statement here. Example: "{company_name} is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees."]`
"""

def generate_jd(prompt_data: JDBuilderPrompt) -> GeneratedJD:
    
    if not llm_client.text_model:
        return GeneratedJD(markdown_text="Error: LLM client not initialized. Please check API key.")

    company_name = prompt_data.company_name or "[Company Name]"

    # Format the system prompt with the desired tone and company name
    system_prompt = _SYSTEM_PROMPT.format(
        tone=prompt_data.tone, 
        company_name=company_name
    )

    # Combine the system prompt and the user's simple prompt
    full_prompt = f"{system_prompt}\n\n**User Prompt:**\n\"{prompt_data.prompt}\""
    
    print("Generating JD... (This may take a moment)")
    
    markdown_output = llm_client.generate_text(full_prompt)
    
    if "Error:" in markdown_output:
        return GeneratedJD(markdown_text=markdown_output)

    return GeneratedJD(markdown_text=markdown_output)

if __name__ == '__main__':
    from src.core.config import Config

    if not Config.GOOGLE_API_KEY:
        print("!!! Skipping JD Builder test: GOOGLE_API_KEY not found in .env file.")
    else:
        print("--- Running JD Builder Test ---")
        
        # 1. Define the user's simple prompt
        user_input = JDBuilderPrompt(
            prompt="Senior Python Developer for a fintech startup. 5+ years experience. Needs to know Django, PostgreSQL, and AWS."
        )
        
        # 2. Generate the JD
        generated_jd = generate_jd(user_input)
        
        # 3. Print the result
        print("\n" + "="*50)
        print("     GENERATED JOB DESCRIPTION")
        print("="*50 + "\n")
        print(generated_jd.markdown_text)
