import google.generativeai as genai
from typing import List, Optional

from src.core.config import Config

class _LLMClient:
    def __init__(self):
        self.text_model = None
        self.embedding_model_name = "models/text-embedding-004"
        
        if Config.GOOGLE_API_KEY:
            try:
                genai.configure(api_key=Config.GOOGLE_API_KEY)
                self.text_model = genai.GenerativeModel('gemini-2.5-flash')
                print("Shared LLM Client initialized successfully.")
            except Exception as e:
                print(f"!!! ERROR: Failed to configure Google AI SDK in LLMClient: {e}")
        else:
            print("!!! WARNING: GOOGLE_API_KEY not found. LLMClient will be non-functional.")

    def generate_text(self, prompt: str) -> str:
        if not self.text_model:
            print("Cannot generate text: Text model not initialized in LLMClient.")
            return "Error: LLM model not available."
        
        try:
            response = self.text_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"LLMClient Error during text generation: {e}")
            return "Error: Could not generate a response."

    def generate_embedding(self, text: str) -> Optional[List[float]]:
        
        if not Config.GOOGLE_API_KEY:
            print("Cannot generate embedding: API key not configured.")
            return None
        if not text or not text.strip():
            return None
        
        try:
            result = genai.embed_content(
                model=self.embedding_model_name,
                content=text,
                task_type="RETRIEVAL_DOCUMENT"
            )
            return result['embedding']
        except Exception as e:
            print(f"LLMClient Error during embedding generation: {e}")
            return None

# Create a single, shared instance that the rest of your application will import
llm_client = _LLMClient()