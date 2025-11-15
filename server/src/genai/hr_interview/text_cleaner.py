# import re


# def clean_text_for_speech(text: str) -> str:
  
#     # Remove markdown formatting
#     text = re.sub(r'\*\*', '', text)
#     text = re.sub(r'\*', '', text)
#     text = re.sub(r'#{1,6}\s', '', text)
    
#     # Remove brackets and special notations
#     text = re.sub(r'\[.*?\]', '', text)
#     text = re.sub(r'\(.*?\)', '', text)
    
#     # Remove multiple spaces and newlines
#     text = re.sub(r'\s+', ' ', text)
    
#     # Remove thinking process indicators
#     text = re.sub(
#         r'(Let me|I will|I am going to|First,|Second,|Finally,).*?\.',
#         '',
#         text,
#         flags=re.IGNORECASE
#     )
    
#     # Extract actual questions
#     sentences = text.split('.')
#     question_sentences = [
#         s for s in sentences
#         if '?' in s or any(
#             word in s.lower()
#             for word in ['tell me', 'describe', 'explain', 'what', 'how', 'why', 'can you']
#         )
#     ]
    
#     if question_sentences:
#         text = '. '.join(question_sentences).strip()
    
#     return text.strip()



import re


def clean_text_for_speech(text: str) -> str:
    """
    Clean text for natural speech while preserving complete messages.
    
    Removes:
    - Markdown formatting
    - Brackets and parentheses
    - Excessive whitespace
    
    Preserves:
    - Full welcoming messages
    - Complete questions
    - All relevant content
    """
    # Remove markdown formatting
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'\*', '', text)
    text = re.sub(r'#{1,6}\s', '', text)
    
    # Remove brackets and special notations
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    
    # Remove multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Only remove obvious LLM thinking indicators (very specific)
    # Don't remove normal conversation starters
    text = re.sub(
        r'(Let me think|I will now|I am going to generate|First, let me|Second, I will).*?\.',
        '',
        text,
        flags=re.IGNORECASE
    )
    
    # Clean up any extra spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()