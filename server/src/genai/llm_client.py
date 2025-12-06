import google.generativeai as genai
from typing import List, Dict, Optional
from src.core.config import Config


class LLMClient:
   
    def __init__(self):
        self.api_key = Config.GOOGLE_API_KEY if hasattr(Config, 'GOOGLE_API_KEY') else None
        self.model_name = "gemini-2.5-flash"    # use this model for fast responses gemini-2.0-flash-exp 
        self.text_model = None
        self.embedding_model_name = "models/text-embedding-004"
        
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY not found. LLMClient will be non-functional.")
            return
        
        try:
            # Configure Google AI SDK
            genai.configure(api_key=self.api_key)
            self.text_model = genai.GenerativeModel(self.model_name)
            print(f"✓ LLM Client initialized successfully ({self.model_name})")
        except Exception as e:
            print(f"!!! ERROR: Failed to configure Google AI SDK: {e}")
    
    
    def call_llm(self, messages: List[Dict], temperature: float = 0.7) -> str:

        if not self.text_model:
            raise Exception("LLM model not initialized. Check GEMINI_API_KEY.")
        
        try:
            # Convert OpenAI-style messages to Gemini SDK format
            chat_history = []
            system_instruction = None
            final_user_message = None
            
            for msg in messages:
                role = msg["role"]
                content = msg["content"]
                
                if role == "system":
                    # Store system instruction to prepend to first user message
                    system_instruction = content
                
                elif role == "user":
                    # For single-turn: this is the main prompt
                    # For multi-turn: add to history
                    if final_user_message is not None:
                        # Previous user message goes to history
                        chat_history.append({"role": "user", "parts": [final_user_message]})
                    final_user_message = content
                
                elif role == "assistant":
                    # Add assistant response to history
                    chat_history.append({"role": "model", "parts": [content]})
            
            # Prepend system instruction to final user message if exists
            if system_instruction and final_user_message:
                final_user_message = f"{system_instruction}\n\n{final_user_message}"
            elif system_instruction:
                final_user_message = system_instruction
            
            # Configure generation
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
            )
            
            # Handle single-turn vs multi-turn
            if not chat_history:
                # Single-turn conversation (most common in HR interview)
                response = self.text_model.generate_content(
                    final_user_message,
                    generation_config=generation_config
                )
            else:
                # Multi-turn conversation with history
                chat = self.text_model.start_chat(history=chat_history)
                response = chat.send_message(
                    final_user_message,
                    generation_config=generation_config
                )
            
            return response.text.strip()
        
        except Exception as e:
            print(f"LLMClient Error in call_llm: {e}")
            raise Exception(f"LLM generation failed: {str(e)}")
    
    
    def generate_text(self, prompt: str, temperature: float = 0.7) -> str:

        if not self.text_model:
            return "Error: LLM model not available."
        
        try:
            # Configure generation
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
            )
            
            response = self.text_model.generate_content(
                prompt,
                generation_config=generation_config
            )
            return response.text.strip()
        
        except Exception as e:
            print(f"LLMClient Error during text generation: {e}")
            return "Error: Could not generate a response."
    
    async def generate_text_async(self, prompt: str) -> str:
        try:
            # Use the asynchronous ..._async() method from the library
            response = await self.text_model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Error: {e}"

    
    def generate_embedding(self, text: str) -> Optional[List[float]]:

        if not self.api_key:
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


# Create a single, shared instance
llm_client = LLMClient()

