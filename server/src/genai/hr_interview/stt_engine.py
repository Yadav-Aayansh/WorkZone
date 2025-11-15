# from src.core.logger import logger

# try:
#     from google.cloud import speech
#     STT_AVAILABLE = True
# except ImportError:
#     STT_AVAILABLE = False
#     print("Warning: Google Cloud STT not available")


# def initialize_stt_client():
#     if not STT_AVAILABLE:
#         return None
    
#     try:
#         # Use the same credential initialization as storage.py
#         from src.core.config import Config
#         from google.oauth2 import service_account
        
#         # Create credentials the same way storage.py does
#         credentials = service_account.Credentials.from_service_account_info({
#             "type": "service_account",
#             "project_id": Config.GOOGLE_PROJECT_ID,
#             "private_key": Config.GOOGLE_PRIVATE_KEY,
#             "client_email": Config.GOOGLE_CLIENT_EMAIL,
#             "token_uri": "https://oauth2.googleapis.com/token"
#         })
        
#         client = speech.SpeechClient(credentials=credentials)
#         return client
#     except Exception as e:
#         print(f"STT initialization error: {e}")
#         return None


# # Initialize client
# stt_client = initialize_stt_client()


# async def speech_to_text(audio_data: bytes) -> str:
#     if not stt_client:
#         raise Exception(
#             "Google Cloud STT not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
#         )
    
#     try:
#         # encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        
#         # Configure recognition
#         # audio = speech.RecognitionAudio(content=audio_data)
#         # config = speech.RecognitionConfig(
#         #     encoding=encoding,
#         #     sample_rate_hertz=48000,
#         #     audio_channel_count=1,
#         #     language_code="en-IN",
#         #     enable_automatic_punctuation=True,
#         #     model="default",
#         # )
#         audio = speech.RecognitionAudio(content=audio_data)

#         config = speech.RecognitionConfig(
#             encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
#             sample_rate_hertz=48000,
#             audio_channel_count=1,
#             language_code="en-IN",
#             alternative_language_codes=["en-US"],
#             enable_automatic_punctuation=True,
#             use_enhanced=True,
#             model="latest_short",
#         )


    
#         # Perform transcription
#         response = stt_client.recognize(config=config, audio=audio)
        
#         # Combine all transcriptions
#         transcription = ""
#         for result in response.results:
#             transcription += result.alternatives[0].transcript + " "
        
#         return transcription.strip()
    
#     except Exception as e:
#         logger.error(f"STT failed: {e}")  # ← at least log it
#         raise



# from src.core.logger import logger

# try:
#     from google.cloud import speech
#     STT_AVAILABLE = True
# except ImportError:
#     STT_AVAILABLE = False
#     print("Warning: Google Cloud STT not available")


# def initialize_stt_client():
#     if not STT_AVAILABLE:
#         return None
    
#     try:
#         # Use the same credential initialization as storage.py
#         from src.core.config import Config
#         from google.oauth2 import service_account
        
#         # Create credentials the same way storage.py does
#         credentials = service_account.Credentials.from_service_account_info({
#             "type": "service_account",
#             "project_id": Config.GOOGLE_PROJECT_ID,
#             "private_key": Config.GOOGLE_PRIVATE_KEY,
#             "client_email": Config.GOOGLE_CLIENT_EMAIL,
#             "token_uri": "https://oauth2.googleapis.com/token"
#         })
        
#         client = speech.SpeechClient(credentials=credentials)
#         return client
#     except Exception as e:
#         print(f"STT initialization error: {e}")
#         return None


# # Initialize client
# stt_client = initialize_stt_client()


# async def speech_to_text(audio_data: bytes) -> str:
#     """
#     Enhanced speech-to-text with better quality settings
    
#     Improvements:
#     - Uses latest_long model for better context understanding
#     - Enables word confidence scores
#     - Adds multiple language alternatives
#     - Disables spoken punctuation/emojis
#     - Logs confidence for debugging
#     """
#     if not stt_client:
#         raise Exception(
#             "Google Cloud STT not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
#         )
    
#     try:
#         audio = speech.RecognitionAudio(content=audio_data)

#         config = speech.RecognitionConfig(
#             # Audio format
#             encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
#             sample_rate_hertz=48000,
#             audio_channel_count=1,
            
#             # Language settings - multiple alternatives for better accuracy
#             language_code="en-IN",  # Indian English as primary
#             alternative_language_codes=["en-US", "en-GB"],  # American & British English
            
#             # Quality enhancements
#             enable_automatic_punctuation=True,
#             enable_spoken_punctuation=False,  # Don't transcribe "comma", "period"
#             enable_spoken_emojis=False,  # Don't transcribe emoji descriptions
#             enable_word_confidence=True,  # Get confidence scores per word
            
#             # Use enhanced model (better accuracy)
#             use_enhanced=True,
#             model="latest_long",  # Better for longer utterances and context
            
#             # Other settings
#             profanity_filter=False,  # Don't filter profanity
#             max_alternatives=1,  # Only get top result
#         )

#         # Perform transcription
#         logger.info(f"Starting STT transcription for {len(audio_data)} bytes")
#         response = stt_client.recognize(config=config, audio=audio)
        
#         # Check if we got any results
#         if not response.results:
#             logger.warning("STT returned no results - audio may be unclear or empty")
#             return ""
        
#         # Combine all transcriptions with confidence logging
#         transcription = ""
#         total_confidence = 0
#         result_count = 0
        
#         for i, result in enumerate(response.results):
#             alternative = result.alternatives[0]
#             transcription += alternative.transcript + " "
            
#             # Log confidence for debugging
#             if hasattr(alternative, 'confidence'):
#                 confidence = alternative.confidence
#                 total_confidence += confidence
#                 result_count += 1
                
#                 logger.info(f"STT segment {i+1} confidence: {confidence:.2%}")
                
#                 # Warn if confidence is low
#                 if confidence < 0.7:
#                     logger.warning(f"Low confidence ({confidence:.2%}): '{alternative.transcript}'")
        
#         final_transcription = transcription.strip()
        
#         # Log overall quality
#         if result_count > 0:
#             avg_confidence = total_confidence / result_count
#             logger.info(f"STT completed: {len(final_transcription)} chars, avg confidence: {avg_confidence:.2%}")
#         else:
#             logger.info(f"STT completed: {len(final_transcription)} chars")
        
#         return final_transcription
    
#     except Exception as e:
#         logger.error(f"STT failed: {e}")
#         raise

from src.core.logger import logger
import tempfile
import os

try:
    from groq import AsyncGroq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq package not available. Install: pip install groq")

# Initialize Groq client
groq_client = None

def initialize_groq_client():
    """Initialize Groq Whisper client (FREE!)"""
    if not GROQ_AVAILABLE:
        return None
    
    try:
        from src.core.config import Config
        
        # Get Groq API key from config
        api_key = getattr(Config, 'GROQ_API_KEY', None)
        
        if not api_key:
            logger.error("GROQ_API_KEY not found in config")
            return None
        
        client = AsyncGroq(api_key=api_key)
        logger.info("Groq Whisper client initialized successfully")
        return client
        
    except Exception as e:
        logger.error(f"Groq initialization error: {e}")
        return None


# Initialize client
groq_client = initialize_groq_client()


async def speech_to_text(audio_data: bytes) -> str:
    if not groq_client:
        raise Exception(
            "Groq client not initialized. Set GROQ_API_KEY in config"
        )
    
    try:
        logger.info(f"Starting Groq Whisper transcription for {len(audio_data)} bytes")
        
        # Groq API requires a file, so save to temp file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Open and transcribe using Groq's Whisper
            with open(temp_file_path, 'rb') as audio_file:
                transcription = await groq_client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3",  # Latest Whisper model
                    language="en",  # English (auto-detects accent)
                    response_format="text",  # Just get text back
                    temperature=0.0  # Deterministic output
                )
            
            result = transcription.strip() if isinstance(transcription, str) else str(transcription).strip()
            
            if len(result) < 1:
                logger.warning("No speech detected")
                return "No speech detected"
            
            logger.info(f"Groq Whisper completed: {len(result)} chars")
            
            return result
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Groq Whisper transcription failed: {e}")
        raise

    
async def speech_to_text_with_prompt(audio_data: bytes, prompt: str = None) -> str:
    """
    Transcribe with optional prompt to guide Whisper
    
    The prompt helps Whisper understand context and vocabulary.
    Useful for technical interviews.
    
    Args:
        audio_data: Audio bytes
        prompt: Context prompt (e.g., "Technical interview about FastAPI and MongoDB")
    
    Example:
        prompt = "Technical terms: FastAPI, MongoDB, Docker, Kubernetes"
        text = await speech_to_text_with_prompt(audio_data, prompt)
    """
    if not groq_client:
        raise Exception("Groq client not initialized")
    
    try:
        logger.info(f"Starting Groq with prompt: {prompt[:50] if prompt else 'None'}...")
        
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            with open(temp_file_path, 'rb') as audio_file:
                transcription = await groq_client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3",
                    language="en",
                    response_format="text",
                    temperature=0.0,
                    prompt=prompt  # Context for Whisper
                )
            
            result = transcription.strip() if isinstance(transcription, str) else str(transcription).strip()
            logger.info(f"Groq with prompt completed: {len(result)} chars")
            
            return result
            
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Groq with prompt failed: {e}")
        raise