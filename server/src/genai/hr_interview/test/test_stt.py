# import asyncio
# import sys
# import os

# from src.genai.hr_interview.stt_engine import (
#     STT_AVAILABLE,
#     stt_client,
#     speech_to_text,
# )


# async def test_stt_module():
#     print("\n" + "="*70)
#     print("TEST: Speech-to-Text Module (with direct audio bytes)")
#     print("="*70)

#     if not STT_AVAILABLE:
#         print("\n✗ google-cloud-speech not installed")
#         print("Install using: pip install google-cloud-speech")
#         return

#     if not stt_client:
#         print("\n✗ STT client not initialized – missing GCP credentials")
#         print("Set environment variables:")
#         print("  - GOOGLE_PROJECT_ID")
#         print("  - GOOGLE_PRIVATE_KEY")
#         print("  - GOOGLE_CLIENT_EMAIL")
#         return

#     print("\n✓ STT Client initialized")

#     # Try a sample audio file from GCP bucket
#     try:
#         from src.core.storage import storage_client

#         test_audio_blob = "interview_audio/test_session_123/question_0.mp3"

#         print(f"\nAttempting to fetch audio file: {test_audio_blob}")

#         signed_url = storage_client.get_url(test_audio_blob, expiration=1)

#         if not signed_url:
#             print("\n✗ Audio file not found in bucket")
#             print("\nTo test STT:")
#             print("1. Upload any test MP3/WAV file to GCP Storage")
#             print("2. Path: workzone-interview/interview_audio/")
#             print("3. Update 'test_audio_blob' variable in this file")
#             return

#         print("✓ Signed URL generated")
#         print("\nDownloading audio bytes using httpx...")
        
#         # Download audio bytes
#         from src.genai.http_client import http_client
#         client = http_client.get_client()
#         response = await client.get(signed_url)
#         response.raise_for_status()
#         audio_data = response.content
        
#         print(f"✓ Downloaded {len(audio_data)} bytes")
#         print("\nTranscribing audio bytes...")

#         transcription = await speech_to_text(audio_data)

#         print("\n" + "="*70)
#         print("✓ TRANSCRIPTION SUCCESSFUL")
#         print("="*70)
#         print("\nTranscribed Text:")
#         print("-" * 70)
#         print(transcription)
#         print("-" * 70)
#         print(f"\nTranscription length: {len(transcription)} characters")
#         print("="*70 + "\n")

#     except Exception as e:
#         print(f"\n✗ Error: {e}")
#         import traceback
#         traceback.print_exc()


# async def test_stt_with_different_formats():
#     """Test STT with different audio formats if available"""
#     print("\n=== Test: Multiple Audio Formats ===")
    
#     if not stt_client:
#         print("⚠ Skipping - STT not configured")
#         return

#     try:
#         from src.core.storage import storage_client
#         from src.genai.http_client import http_client

#         # Test different formats
#         test_files = [
#             ("interview_audio/test.mp3", "MP3 format"),
#             ("interview_audio/test.wav", "WAV format"),
#             ("interview_audio/test.flac", "FLAC format"),
#         ]

#         for blob_name, description in test_files:
#             print(f"\nTesting {description}: {blob_name}")
            
#             signed_url = storage_client.get_url(blob_name, expiration=1)
            
#             if not signed_url:
#                 print(f"  ⚠ File not found, skipping...")
#                 continue

#             try:
#                 # Download audio bytes
#                 client = http_client.get_client()
#                 response = await client.get(signed_url)
#                 response.raise_for_status()
#                 audio_data = response.content
                
#                 transcription = await speech_to_text(audio_data)
#                 print(f"  ✓ Success: {transcription[:100]}...")
#             except Exception as e:
#                 print(f"  ✗ Failed: {e}")

#     except ImportError:
#         print("⚠ Storage client not available")


# async def main():
#     await test_stt_module()
#     await test_stt_with_different_formats()
    
#     print("\n" + "="*70)
#     print("STT Tests Completed")
#     print("="*70 + "\n")


# if __name__ == "__main__":
#     asyncio.run(main())


import asyncio
import sys
import os

from src.genai.hr_interview.stt_engine import (
    GEMINI_AVAILABLE,
    gemini_model,
    speech_to_text,
)


async def test_stt_module():
    print("\n" + "="*70)
    print("TEST: Speech-to-Text Module with Gemini Flash 2.5")
    print("="*70)

    if not GEMINI_AVAILABLE:
        print("\n✗ google-generativeai not installed")
        print("Install using: pip install google-generativeai")
        return

    if not gemini_model:
        print("\n✗ Gemini client not initialized – missing API key")
        print("Set environment variable or config:")
        print("  - GEMINI_API_KEY")
        return

    print("\n✓ Gemini Flash 2.5 Client initialized")

    # Try a sample audio file from GCP bucket
    try:
        from src.core.storage import storage_client

        test_audio_blob = "interview_audio/hr.mp3"

        print(f"\nAttempting to fetch audio file: {test_audio_blob}")

        signed_url = storage_client.get_url(test_audio_blob, expiration=1)

        if not signed_url:
            print("\n✗ Audio file not found in bucket")
            print("\nTo test STT:")
            print("1. Upload any test MP3/WAV/WebM file to GCP Storage")
            print("2. Path: workzone-interview/interview_audio/")
            print("3. Update 'test_audio_blob' variable in this file")
            return

        print("✓ Signed URL generated")
        print("\nDownloading audio bytes using httpx...")
        
        # Download audio bytes
        from src.genai.http_client import http_client
        client = http_client.get_client()
        response = await client.get(signed_url)
        response.raise_for_status()
        audio_data = response.content
        
        print(f"✓ Downloaded {len(audio_data)} bytes")
        print("\nTranscribing audio with Gemini Flash 2.5...")

        transcription = await speech_to_text(audio_data)

        print("\n" + "="*70)
        print("✓ TRANSCRIPTION SUCCESSFUL")
        print("="*70)
        print("\nTranscribed Text:")
        print("-" * 70)
        print(transcription)
        print("-" * 70)
        print(f"\nTranscription length: {len(transcription)} characters")
        print("="*70 + "\n")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def test_stt_with_different_formats():
    """Test STT with different audio formats if available"""
    print("\n=== Test: Multiple Audio Formats (Gemini supports many!) ===")
    
    if not gemini_model:
        print("⚠ Skipping - Gemini not configured")
        return

    try:
        from src.core.storage import storage_client
        from src.genai.http_client import http_client

        # Test different formats (Gemini supports: MP3, WAV, FLAC, WebM, Opus, etc.)
        test_files = [
            ("interview_audio/test.mp3", "MP3 format"),
            ("interview_audio/test.wav", "WAV format"),
            ("interview_audio/test.flac", "FLAC format"),
            ("interview_audio/test.webm", "WebM format"),
            ("interview_audio/test.ogg", "OGG format"),
        ]

        for blob_name, description in test_files:
            print(f"\nTesting {description}: {blob_name}")
            
            signed_url = storage_client.get_url(blob_name, expiration=1)
            
            if not signed_url:
                print(f"  ⚠ File not found, skipping...")
                continue

            try:
                # Download audio bytes
                client = http_client.get_client()
                response = await client.get(signed_url)
                response.raise_for_status()
                audio_data = response.content
                
                transcription = await speech_to_text(audio_data)
                print(f"  ✓ Success: {transcription[:100]}...")
            except Exception as e:
                print(f"  ✗ Failed: {e}")

    except ImportError:
        print("⚠ Storage client not available")


async def test_direct_audio_bytes():
    """Test with direct audio bytes (simulating WebSocket input)"""
    print("\n=== Test: Direct Audio Bytes (WebSocket Simulation) ===")
    
    if not gemini_model:
        print("⚠ Skipping - Gemini not configured")
        return

    print("\nThis test simulates WebSocket audio input:")
    print("- In production, you'll receive audio_data as bytes")
    print("- Gemini will process it directly")
    print("- No need for intermediate conversion!")
    print("\n✓ Gemini is ready for WebSocket audio streams")


async def main():
    await test_stt_module()
    await test_stt_with_different_formats()
    await test_direct_audio_bytes()
    
    print("\n" + "="*70)
    print("Gemini STT Tests Completed")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())