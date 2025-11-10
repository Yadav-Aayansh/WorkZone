import os
import io
from src.genai.hr_interview.text_cleaner import clean_text_for_speech

# Conditional import for testing without full config
try:
    from src.core.storage import storage_client
    STORAGE_AVAILABLE = True
except Exception as e:
    STORAGE_AVAILABLE = False
    print(f"Warning: Storage client not available: {e}")

try:
    from google.cloud import texttospeech
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("Warning: Google Cloud TTS not available")


# Configuration
GOOGLE_VOICE_NAME = "en-IN-Neural2-A"
GOOGLE_LANGUAGE_CODE = "en-IN"


def initialize_tts_client():
    if not TTS_AVAILABLE:
        return None
    
    try:
        # Use the same credential initialization as storage.py
        if STORAGE_AVAILABLE:
            from src.core.config import Config
            from google.oauth2 import service_account
            
            # Create credentials the same way storage.py does
            credentials = service_account.Credentials.from_service_account_info({
                "type": "service_account",
                "project_id": Config.GOOGLE_PROJECT_ID,
                "private_key": Config.GOOGLE_PRIVATE_KEY,
                "client_email": Config.GOOGLE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token"
            })
            
            client = texttospeech.TextToSpeechClient(credentials=credentials)
            return client
        else:
            # Fallback to default credentials
            client = texttospeech.TextToSpeechClient()
            return client
    except Exception as e:
        print(f"TTS initialization error: {e}")
        return None


# Initialize client
tts_client = initialize_tts_client()


async def text_to_speech(text: str, session_id: str, question_index: int) -> str:
    if not tts_client:
        raise Exception(
            "Google Cloud TTS not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
        )
    
    if not STORAGE_AVAILABLE:
        raise Exception(
            "Storage client not available. Ensure all environment variables are set."
        )
    
    try:
        # Clean text for natural speech
        clean_text = clean_text_for_speech(text)
        
        # Configure TTS input
        synthesis_input = texttospeech.SynthesisInput(text=clean_text)
        
        # Voice configuration - Indian English Neural2 voice
        voice = texttospeech.VoiceSelectionParams(
            language_code=GOOGLE_LANGUAGE_CODE,
            name=GOOGLE_VOICE_NAME,
        )
        
        # Audio configuration
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0,
            effects_profile_id=["headphone-class-device"],
        )
        
        # Generate speech
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Create UploadFile-like object from audio bytes
        filename = f"question_{question_index}.mp3"
        audio_bytes = io.BytesIO(response.audio_content)
        
        # Create a simple file-like object with required attributes
        class AudioFile:
            def __init__(self, filename, content, content_type):
                self.filename = filename
                self.file = io.BytesIO(content)
                self.content_type = content_type
        
        audio_file = AudioFile(filename, response.audio_content, "audio/mpeg")
        
        # Upload to GCP Storage
        folder = f"interview_audio_generated/{session_id}"
        blob_name, signed_url = storage_client.upload(audio_file, folder, expiration=7)
        
        return signed_url
    
    except Exception as e:
        raise Exception(f"TTS error: {str(e)}")
