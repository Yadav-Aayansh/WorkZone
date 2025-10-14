"""
Speech-to-Text Module
Converts audio to text using Google Cloud STT (Indian English)
"""

import os

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
        client = speech.SpeechClient()
        return client
    except Exception as e:
        print(f"STT initialization error: {e}")
        return None


# Initialize client
stt_client = initialize_stt_client()


def speech_to_text(audio_path: str) -> str:
   
    if not stt_client:
        raise Exception(
            "Google Cloud STT not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
        )
    
    try:
        # Detect encoding based on file extension
        ext = audio_path.split(".")[-1].lower()
        
        encoding_map = {
            "wav": speech.RecognitionConfig.AudioEncoding.LINEAR16,
            "flac": speech.RecognitionConfig.AudioEncoding.FLAC,
            "mp3": speech.RecognitionConfig.AudioEncoding.MP3
        }
        
        encoding = encoding_map.get(
            ext,
            speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED
        )
        
        # Read audio file
        with open(audio_path, "rb") as f:
            audio_data = f.read()
        
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
        
        # Test transcription
        test_audio = "test_audio/hr.mp3"
        
        if not os.path.exists(test_audio):
            print(f"\n⚠ Test audio file '{test_audio}' not found")
            print("Please provide a test audio file to run the test")
        else:
            try:
                transcription = speech_to_text(test_audio)
                print(f"\n✓ Transcription successful:")
                print(f"  Text: {transcription}")
            except Exception as e:
                print(f"✗ Error: {e}")
