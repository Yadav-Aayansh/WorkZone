import asyncio
import sys
import os

# # Ensure src/ is available in import path
# ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# sys.path.append(ROOT_DIR)

from src.genai.hr_interview.stt_engine import (
    STT_AVAILABLE,
    stt_client,
    speech_to_text,
)


async def test_stt_module():
    print("\n=== TEST: Speech-to-Text Module ===")
    print("====================================")

    if not STT_AVAILABLE:
        print("✗ google-cloud-speech not installed")
        print("Install using: pip install google-cloud-speech")
        return

    if not stt_client:
        print("✗ STT client not initialized — missing GCP credentials")
        return

    print("✓ STT Client initialized")

    # Try a sample audio file from GCP bucket
    try:
        from src.core.storage import storage_client

        test_audio_blob = "interview_audio/hr.mp3"

        print(f"\nTrying to fetch audio file: {test_audio_blob}")

        signed_url = storage_client.get_url(test_audio_blob, expiration=1)

        if not signed_url:
            print("✗ Audio file not found in bucket")
            print("\nUpload any test MP3 file to:")
            print(" → GCP Storage → workzone-interview → interview_audio/")
            print("Then update test_audio_blob variable.")
            return

        print("✓ Signed URL generated")
        print("Fetching + transcribing audio...")

        transcription = await speech_to_text(signed_url)

        print("✓ Transcription successful")
        print("\n===== TRANSCRIBED TEXT =====")
        print(transcription)
        print("============================\n")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def main():
    await test_stt_module()


if __name__ == "__main__":
    asyncio.run(main())
