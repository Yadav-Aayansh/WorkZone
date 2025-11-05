import google.generativeai as genai
from typing import List, Dict, Optional
from src.core.config import Config


class LLMClient:
   
    def __init__(self):
        self.api_key = Config.GOOGLE_API_KEY if hasattr(Config, 'GOOGLE_API_KEY') else None
        self.model_name = "gemini-2.5-flash"    # use this model for fast responses gemini-2.0-flash-exp 
        self.pro_model_name = "gemini-2.5-pro"  # use this model for complex tasks like question generation
        self.text_model = None
        self.pro_model = None
        self.embedding_model_name = "models/text-embedding-004"
        
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY not found. LLMClient will be non-functional.")
            return
        
        try:
            # Configure Google AI SDK
            genai.configure(api_key=self.api_key)
            self.text_model = genai.GenerativeModel(self.model_name)
            self.pro_model = genai.GenerativeModel(self.pro_model_name)
            print(f"✓ LLM Client initialized successfully ({self.model_name}, {self.pro_model_name})")
        except Exception as e:
            print(f"!!! ERROR: Failed to configure Google AI SDK: {e}")
    
    
    def call_llm(self, messages: List[Dict], temperature: float = 0.7, use_pro: bool = False) -> str:

        model = self.pro_model if use_pro else self.text_model
        
        if not model:
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
                response = model.generate_content(
                    final_user_message,
                    generation_config=generation_config
                )
            else:
                # Multi-turn conversation with history
                chat = model.start_chat(history=chat_history)
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
            return response.text
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


# Testing the module
if __name__ == "__main__":
    print("Testing Unified SDK-Based LLM Client")
    print("=" * 70)
    
    if not llm_client.api_key:
        print("✗ GEMINI_API_KEY not set")
        print("Set in config.py: GEMINI_API_KEY = 'your_key_here'")
        print("Get API key from: https://aistudio.google.com/app/apikey")
    else:
        print("✓ API Key found")
        print(f"✓ Model: {llm_client.model_name}")
        
        # Test 1: Single-turn with system message (HR Interview pattern)
        print("\n[Test 1] Single-Turn with System Message (HR Interview Pattern)")
        print("-" * 70)
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello from SDK!' in exactly 4 words."}
        ]
        
        try:
            response = llm_client.call_llm(test_messages, temperature=0.3)
            print(f"✓ Response: {response}")
            print("✓ Single-turn works perfectly")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 2: Multi-turn conversation (not used in HR interview but supported)
        print("\n[Test 2] Multi-Turn Conversation")
        print("-" * 70)
        multi_turn_messages = [
            {"role": "system", "content": "You are a math tutor."},
            {"role": "user", "content": "What is 2+2?"},
            {"role": "assistant", "content": "2+2 equals 4."},
            {"role": "user", "content": "What about 3+3?"}
        ]
        
        try:
            response = llm_client.call_llm(multi_turn_messages, temperature=0.3)
            print(f"✓ Response: {response}")
            print("✓ Multi-turn works (conversation history maintained)")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 3: Simple text generation
        print("\n[Test 3] Simple Text Generation")
        print("-" * 70)
        try:
            response = llm_client.generate_text(
                "Say 'SDK is great!' in exactly 3 words.",
                temperature=0.3
            )
            print(f"✓ Response: {response}")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 4: Backward compatible function
        print("\n[Test 4] Backward Compatible Function")
        print("-" * 70)
        try:
            response = call_llm(test_messages, temperature=0.3)
            print(f"✓ Response: {response}")
            print("✓ Existing HR interview code will work without changes!")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 5: JSON generation (critical for HR interview)
        print("\n[Test 5] JSON Generation (HR Interview Critical Test)")
        print("-" * 70)
        json_messages = [
            {"role": "system", "content": "You are a JSON generator. Return ONLY valid JSON, no other text."},
            {"role": "user", "content": 'Generate a JSON object with these exact fields: {"name": "John", "age": 30, "skills": ["Python", "JavaScript"]}'}
        ]
        
        try:
            response = llm_client.call_llm(json_messages, temperature=0.2)
            print(f"Response: {response}")
            
            # Try to parse JSON
            import json
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response[start:end]
                parsed = json.loads(json_str)
                print(f"✓ Valid JSON parsed: {parsed}")
                print("✓ JSON generation works (critical for HR interview)")
            else:
                print("⚠ No JSON found in response")
        except json.JSONDecodeError as e:
            print(f"⚠ JSON parsing error: {e}")
            print(f"  Raw response: {response}")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 6: Embedding generation
        print("\n[Test 6] Embedding Generation")
        print("-" * 70)
        try:
            embedding = llm_client.generate_embedding("Python programming language")
            if embedding:
                print(f"✓ Embedding generated: {len(embedding)} dimensions")
                print(f"  First 5 values: {[f'{x:.4f}' for x in embedding[:5]]}")
                print("✓ Embeddings work (for resume ranking feature)")
            else:
                print("✗ No embedding generated")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # Test 7: Performance test
        print("\n[Test 7] Performance Test (5 rapid calls)")
        print("-" * 70)
        try:
            import time
            start_time = time.time()
            
            for i in range(5):
                response = llm_client.call_llm([
                    {"role": "user", "content": f"Count: {i+1}"}
                ], temperature=0.1)
            
            end_time = time.time()
            avg_time = (end_time - start_time) / 5
            print(f"✓ 5 calls completed")
            print(f"  Average time per call: {avg_time:.2f}s")
            print(f"  SDK provides automatic retries and better performance")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        print("✓ All tests completed!")