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


# Testing the module

if __name__ == "__main__":
    print("Testing Text Cleaner Module")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        "**Question 1:** Tell me about your experience with Python? [Technical]",
        "Let me ask you this. What is your background? How do you handle stress?",
        "### Important Question\n\n*Describe* your (most challenging) project.",
        "I will now ask: Can you explain your approach to problem-solving?"
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\nTest {i}:")
        print(f"Input:  {test_text}")
        cleaned = clean_text_for_speech(test_text)
        print(f"Output: {cleaned}")
        print("✓ Cleaned successfully")
