import asyncio
import sys
import os

from src.genai.hr_interview.pdf_processor import (
    extract_text_from_pdf,
    STORAGE_AVAILABLE,
    storage_client,
)


async def run_tests():
    print("\n" + "="*70)
    print("Testing PDF Processor Module (with httpx)")
    print("="*70)

    if STORAGE_AVAILABLE:
        print("\n✓ Storage client available")
        print("\nTesting with GCP Storage files...")
        print("-" * 70)

        test_blob_names = [
            "resumes/resume.pdf",
            "resumes/resumeimage.pdf",
        ]

        for blob_name in test_blob_names:
            print(f"\nTesting: {blob_name}")
            try:
                signed_url = storage_client.get_url(blob_name, expiration=1)

                if not signed_url:
                    print(f"  ✗ File not found in bucket: {blob_name}")
                    continue

                print("  ✓ Generated signed URL")

                # Extract text using httpx (new implementation)
                text = await extract_text_from_pdf(signed_url)

                print(f"  ✓ Extracted {len(text)} characters using httpx")
                print("  First 200 characters:")
                print("  " + text[:200].replace("\n", " ") + "...")

            except Exception as e:
                print(f"  ✗ Error: {e}")
                import traceback
                traceback.print_exc()

    # Test without GCP (public PDF)
    else:
        print("\n⚠ Storage client not available")
        print("\nTesting with public PDF URL...")
        print("-" * 70)

        # Using a reliable public PDF
        public_pdf_url = "https://arxiv.org/pdf/1706.03762.pdf"  # Transformer paper

        try:
            print(f"\nDownloading PDF from: {public_pdf_url}")
            text = await extract_text_from_pdf(public_pdf_url)
            print(f"✓ Extracted {len(text)} characters using httpx")
            print("\nFirst 300 chars:")
            print(text[:300].replace("\n", " ") + "...")

        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "="*70)
    print("PDF Processor Tests Completed")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(run_tests())
