import re


def clean_text_for_speech(text: str) -> str:
  
    # Remove markdown formatting
    text = re.sub(r'\*\*', '', text)
    text = re.sub(r'\*', '', text)
    text = re.sub(r'#{1,6}\s', '', text)
    
    # Remove brackets and special notations
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\(.*?\)', '', text)
    
    # Remove multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Remove thinking process indicators
    text = re.sub(
        r'(Let me|I will|I am going to|First,|Second,|Finally,).*?\.',
        '',
        text,
        flags=re.IGNORECASE
    )
    
    # Extract actual questions
    sentences = text.split('.')
    question_sentences = [
        s for s in sentences
        if '?' in s or any(
            word in s.lower()
            for word in ['tell me', 'describe', 'explain', 'what', 'how', 'why', 'can you']
        )
    ]
    
    if question_sentences:
        text = '. '.join(question_sentences).strip()
    
    return text.strip()



