"""
LLM Client Module
Handles Groq API calls for interview questions and analysis
"""

import os
import requests
from typing import List, Dict


# Configuration
MODEL_NAME = "llama-3.1-8b-instant"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_llm(messages: List[Dict], temperature: float = 0.7) -> str:
   
    if not GROQ_API_KEY:
        raise Exception(
            "GROQ_API_KEY not set. Get free API key from https://console.groq.com"
        )
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1024,
        "top_p": 0.9
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"LLM API error: {response.text}")


# Testing the module

if __name__ == "__main__":
    print("Testing LLM Client Module")
    print("=" * 60)
    
    if not GROQ_API_KEY:
        print("✗ GROQ_API_KEY not set")
        print("Set environment variable: export GROQ_API_KEY='your_key_here'")
    else:
        print("✓ API Key found")
        
        # Test simple query
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, I am working!' in exactly 5 words."}
        ]
        
        try:
            response = call_llm(test_messages, temperature=0.3)
            print(f"\n✓ LLM Response: {response}")
            print("✓ API connection successful")
        except Exception as e:
            print(f"✗ Error: {e}")
