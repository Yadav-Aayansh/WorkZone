"""
Text-to-Speech Module
Converts text to speech using Google Cloud TTS (Indian English)
"""

import os
from text_cleaner import clean_text_for_speech

try:
    from google.cloud import texttospeech
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("⚠ Warning: Google Cloud TTS not available")


# Configuration
GOOGLE_VOICE_NAME = "en-IN-Neural2-A"
GOOGLE_LANGUAGE_CODE = "en-IN"


def initialize_tts_client():
    """Initialize Google Cloud TTS client"""
    if not TTS_AVAILABLE:
        return None
    
    try:
        client = texttospeech.TextToSpeechClient()
        return client
    except Exception as e:
        print(f"TTS initialization error: {e}")
        return None


# Initialize client
tts_client = initialize_tts_client()


def text_to_speech(text: str, output_path: str) -> str:
   
    if not tts_client:
        raise Exception(
            "Google Cloud TTS not configured. Set GOOGLE_APPLICATION_CREDENTIALS"
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
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save audio file
        with open(output_path, "wb") as f:
            f.write(response.audio_content)
        
        return output_path
    
    except Exception as e:
        raise Exception(f"TTS error: {str(e)}")


# Testing the module

if __name__ == "__main__":
    print("Testing Text-to-Speech Module")
    print("=" * 60)
    
    if not TTS_AVAILABLE:
        print("✗ Google Cloud TTS library not installed")
        print("Install with: pip install google-cloud-texttospeech")
    elif not tts_client:
        print("✗ Google Cloud TTS not configured")
        print("Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
    else:
        print("✓ TTS Client initialized")
        
        # Test conversion
        test_text = "Testing tts_engine if its working fine or not"
        output_file = "test_audio/test_output3.mp3"
        
        try:
            result_path = text_to_speech(test_text, output_file)
            print(f"✓ Audio generated successfully: {result_path}")
            print(f"  Voice: {GOOGLE_VOICE_NAME}")
            print(f"  Language: {GOOGLE_LANGUAGE_CODE}")
        except Exception as e:
            print(f"✗ Error: {e}")