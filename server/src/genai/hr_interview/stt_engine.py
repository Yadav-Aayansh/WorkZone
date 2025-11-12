import os

try:
    from google.cloud import speech
    STT_AVAILABLE = True
except ImportError:
    STT_AVAILABLE = False
    print("Warning: Google Cloud STT not available")

# Import shared HTTP client
# try:
from src.genai.http_client import http_client
# except ImportError:
#     from http_client import http_client  # Fallback for testing


def initialize_stt_client():
    if not STT_AVAILABLE:
        return None
    
    try:
        # Use the same credential initialization as storage.py
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
        
        client = speech.SpeechClient(credentials=credentials)
        return client
    except Exception as e:
        print(f"STT initialization error: {e}")
        return None


# Initialize client
stt_client = initialize_stt_client()


async def speech_to_text(audio_signed_url: str) -> str:
    if not stt_client:
        raise Exception(
            "Google Cloud STT not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
        )
    
    try:
        # Download audio from signed URL using shared httpx client
        client = http_client.get_client()
        response = await client.get(audio_signed_url)
        response.raise_for_status()
        audio_data = response.content
        
        # Detect encoding based on URL extension
        ext = audio_signed_url.split("?")[0].split(".")[-1].lower()
        
        encoding_map = {
            "wav": speech.RecognitionConfig.AudioEncoding.LINEAR16,
            "flac": speech.RecognitionConfig.AudioEncoding.FLAC,
            "mp3": speech.RecognitionConfig.AudioEncoding.MP3
        }
        
        encoding = encoding_map.get(
            ext,
            speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED
        )
        
        # Configure recognition
        audio = speech.RecognitionAudio(content=audio_data)
        config = speech.RecognitionConfig(
            encoding=encoding,
            language_code="en-IN",
            enable_automatic_punctuation=True,
            model="default",
        )
        
        # Perform transcription
        response = stt_client.recognize(config=config, audio=audio)
        
        # Combine all transcriptions
        transcription = ""
        for result in response.results:
            transcription += result.alternatives[0].transcript + " "
        
        return transcription.strip()
    
    except Exception as e:
        raise Exception(f"STT error: {str(e)}")
