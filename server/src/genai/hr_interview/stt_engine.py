from src.core.logger import logger
import base64

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Install: pip install google-generativeai")

gemini_model = None

def initialize_gemini_client():
    if not GEMINI_AVAILABLE:
        return None
    
    try:
        from src.core.config import Config
        
        api_key = getattr(Config, 'GOOGLE_API_KEY', None)
        
        if not api_key:
            logger.error("GOOGLE_API_KEY not found in config")
            return None
                                                                
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("Gemini Flash 2.5 client initialized successfully")
        return model
        
    except Exception as e:
        logger.error(f"Gemini initialization error: {e}")
        return None


gemini_model = initialize_gemini_client()


async def speech_to_text(audio_data: bytes) -> str:
    if not gemini_model:
        raise Exception("Gemini client not initialized.")
    
    try:
        logger.info(f"Starting Gemini transcription for {len(audio_data)} bytes")
        
        # Convert audio to base64 (inline data)
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Create inline audio part
        audio_part = {
            "inline_data": {
                "mime_type": "audio/webm",  # Change to audio/mp3 or audio/wav if needed
                "data": audio_base64
            }
        }
        
        # Generate transcription directly
        response = gemini_model.generate_content([
            "Transcribe this audio clearly and accurately. Return only the transcribed text, nothing else.",
            audio_part
        ])
        
        # Extract text
        result = response.text.strip() if hasattr(response, 'text') else ""
        
        # Check if empty
        if len(result) < 1:
            logger.warning("No speech detected in audio")
            return "No speech detected"
        
        logger.info(f"Gemini transcription completed: {len(result)} chars")
        return result
        
    except Exception as e:
        logger.error(f"Gemini transcription failed: {e}")
        raise