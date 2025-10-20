import re
from typing import Dict, List, Tuple


class SectionParser:

    def __init__(self):
        self.SECTION_KEYWORDS = {
            # --- Common Sections (Resumes & JDs) ---
            "experience": [
                "experience",
                "work experience",
                "professional experience",
                "employment history",
                "work history",
                "internships",
            ],
            "education": [
                "education",
                "academic background",
                "academic qualifications",
            ],
            "skills": [
                "skills",
                "technical skills",
                "proficiencies",
                "technologies",
                "technical qualifications",
            ],
            "projects": ["projects", "personal projects", "academic projects"],

            # --- Resume-Specific Sections ---
            "summary": ["summary", "profile", "objective", "professional summary"],
            "contact": ["contact", "phone", "email", "linkedin", "github"],
            
            # --- Job Description-Specific Sections ---
            "responsibilities": [
                "responsibilities",
                "what you'll do",
                "job duties",
                "your role",
                "day-to-day",
                "main responsibilities",
            ],
            "qualifications": [
                "qualifications",
                "requirements",
                "what you bring",
                "who you are",
                "basic qualifications",
                "preferred qualifications",
                "skills & experience",
            ],
            "about": ["about us", "who we are", "the company", "our mission"],
            "benefits": ["benefits", "what we offer", "perks and benefits"],
        }
        self.header_pattern = re.compile(
            r"^\s*([A-Z][a-zA-Z\s]{4,25})\s*$", re.MULTILINE
        )

    def _find_section_headers(self, text_lines: List[str]) -> List[Tuple[int, str]]:
        headers = []
        for i, line in enumerate(text_lines):
            cleaned_line = line.strip().lower()
            if not cleaned_line:
                continue

            for canonical_name, variations in self.SECTION_KEYWORDS.items():
                if cleaned_line in variations:
                    headers.append((i, canonical_name))
                    break
            else:
                if (
                    len(cleaned_line.split()) <= 4
                    and cleaned_line == line.strip().lower()
                ):
                    for canonical_name, variations in self.SECTION_KEYWORDS.items():
                        if any(var_word in cleaned_line for var_word in variations):
                            headers.append((i, canonical_name))
                            break

        seen = set()
        unique_headers = []
        for item in headers:
            if item[1] not in seen:
                unique_headers.append(item)
                seen.add(item[1])

        return unique_headers

    def parse(self, raw_text: str) -> Dict[str, str]:
        text_lines = raw_text.split("\n")
        found_headers = self._find_section_headers(text_lines)

        if not found_headers:
            return {"content": raw_text}

        found_headers.sort(key=lambda x: x[0])

        sections = {}
        for i, (line_num, section_name) in enumerate(found_headers):
            start_line = line_num + 1
            end_line = None
            if i + 1 < len(found_headers):
                end_line = found_headers[i + 1][0]

            section_content = "\n".join(text_lines[start_line:end_line]).strip()
            sections[section_name] = section_content

        return sections
