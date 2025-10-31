import os
import requests

try:
    from google.cloud import speech
    STT_AVAILABLE = True
except ImportError:
    STT_AVAILABLE = False
    print("Warning: Google Cloud STT not available")


def initialize_stt_client():
    """Initialize Google Cloud STT client"""
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


def speech_to_text(audio_signed_url: str) -> str:
    
    if not stt_client:
        raise Exception(
            "Google Cloud STT not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
        )
    
    try:
        # Download audio from signed URL
        response = requests.get(audio_signed_url)
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


# Testing the module

if __name__ == "__main__":
    print("Testing Speech-to-Text Module")
    print("=" * 60)
    
    if not STT_AVAILABLE:
        print("✗ Google Cloud STT library not installed")
        print("Install with: pip install google-cloud-speech")
    elif not stt_client:
        print("✗ Google Cloud STT not configured")
        print("Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
    else:
        print("✓ STT Client initialized")
        
        # Test transcription with storage client
        try:
            from src.core.storage import storage_client
            
            # Try to get audio file from your bucket
            test_audio_blob = "interview_audio/hr.mp3"
            
            print(f"\nTesting with audio file: {test_audio_blob}")
            print("-" * 60)
            
            # Get signed URL
            signed_url = storage_client.get_url(test_audio_blob, expiration=1)
            
            if not signed_url:
                print(f"✗ Audio file not found: {test_audio_blob}")
                print("\nPlease upload an audio file to test:")
                print("  1. Go to GCP Console → Storage → workzone-interview")
                print("  2. Upload an MP3/WAV file to interview_audio/ folder")
                print("  3. Update test_audio_blob variable with your filename")
            else:
                print(f"✓ Generated signed URL")
                
                # Transcribe
                transcription = speech_to_text(signed_url)
                print(f"✓ Transcription successful")
                print(f"\nTranscribed text:")
                print(f"  {transcription}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()
            print("\nPlease ensure:")
            print("  1. GCP credentials are configured in config.py")
            print("  2. Audio file exists in GCP Storage")
            print("  3. Audio file is in supported format (MP3, WAV, FLAC)")