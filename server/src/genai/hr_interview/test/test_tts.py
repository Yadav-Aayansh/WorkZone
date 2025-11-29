import asyncio
import sys
import os

# # Ensure src/ is available in import path
# ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# sys.path.append(ROOT_DIR)

from src.genai.hr_interview.tts_engine import (
    TTS_AVAILABLE,
    tts_client,
    text_to_speech,
    GOOGLE_VOICE_NAME,
    GOOGLE_LANGUAGE_CODE
)


async def test_tts_module():
    print("\n=== TEST: Google Cloud Text-to-Speech Module ===")
    print("=================================================")

    # Check library
    if not TTS_AVAILABLE:
        print("✗ google-cloud-texttospeech not installed")
        print("Install with: pip install google-cloud-texttospeech")
        return

    # Check GCP credentials
    if not tts_client:
        print("✗ TTS client could NOT be initialized")
        print("• Check GOOGLE_PROJECT_ID, GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL")
        print("• Or set GOOGLE_APPLICATION_CREDENTIALS")
        return

    print("✓ TTS Client initialized")

    # Try generating + uploading audio
    try:
        print("\nPreparing test input...")

        test_text = "FastAPI is a modern, high-performance Python framework used for building APIs with efficient asynchronous support, making it ideal for scalable microservices. Redis often complements FastAPI as an in-memory data store for caching, message brokering, and real-time operations, significantly improving response times. PostgreSQL serves as the primary relational database, offering strong ACID compliance, advanced indexing, and JSON support for complex queries"
        test_session = "test_session_0101"
        test_index = 0

        print(f"✓ Text: '{test_text}'")
        print(f"✓ Voice: {GOOGLE_VOICE_NAME}")
        print(f"✓ Language: {GOOGLE_LANGUAGE_CODE}")

        print("\nGenerating Audio + Uploading to Cloud Storage...")

        signed_url = await text_to_speech(test_text, test_session, test_index)

        print("\n=== TEST RESULT ===")
        print("✓ MP3 file generated")
        print("✓ File uploaded to GCP Storage")
        print(f"Signed URL: {signed_url}")

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


async def main():
    await test_tts_module()


if __name__ == "__main__":
    asyncio.run(main())


