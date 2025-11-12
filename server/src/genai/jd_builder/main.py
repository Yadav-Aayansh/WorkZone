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

**REQUIRED SECTIONS (in this order):**
- `# [Job Title]`
- `## Job Summary` (A brief, engaging overview of the role)
- `## Key Responsibilities` (A bulleted list)
- `## Required Qualifications (Must-Haves)` (A bulleted list of essential skills)
- `## Preferred Qualifications (Nice-to-Haves)` (A bulleted list of non-essential skills)
- `## About {company_name}`
    - `[This is a placeholder for the company boilerplate. Describe the company's mission and culture.]`
- `## Diversity, Equity, and Inclusion Statement`
    - `[Insert the company's standard DEI statement here. Example: "{company_name} is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees."]`
"""

async def generate_jd(prompt_data: JDBuilderPrompt) -> GeneratedJD:
    
    if not llm_client.text_model:
        return GeneratedJD(markdown_text="Error: LLM client not initialized. Please check API key.")

    company_name = prompt_data.company_name or "[Company Name]"

    system_prompt = _SYSTEM_PROMPT.format(
        tone=prompt_data.tone, 
        company_name=company_name
    )

    full_prompt = f"{system_prompt}\n\n**User Prompt:**\n\"{prompt_data.prompt}\""
    
    print("Generating JD... (This may take a moment)")
    
    markdown_output = await llm_client.generate_text_async(full_prompt)
    
    if "Error:" in markdown_output:
        return GeneratedJD(markdown_text=markdown_output)

    return GeneratedJD(markdown_text=markdown_output)
