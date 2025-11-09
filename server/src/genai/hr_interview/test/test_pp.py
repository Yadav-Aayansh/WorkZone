import asyncio
import sys
import os


# # Allow imports from the src/ directory
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.genai.hr_interview.pdf_processor import (
    extract_text_from_pdf,
    STORAGE_AVAILABLE,
    storage_client,
)


async def run_tests():
    print("Testing PDF Processor Module")
    print("=" * 60)

    
    if STORAGE_AVAILABLE:
        print("\n✓ Storage client available")
        print("\nTesting with GCP Storage files...")
        print("-" * 60)

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

            
                text = await extract_text_from_pdf(signed_url)

                print(f"  ✓ Extracted {len(text)} characters")
                print("  First 200 characters:\n ", text[:200], "...")

            except Exception as e:
                print(f"  ✗ Error: {e}")

    # test without GCP (public PDF)
    else:
        print("\n⚠ Storage client not available")
        print("\nTesting with public PDF URL...")
        print("-" * 60)

        public_pdf_url = "https://arxiv.org/pdf/1706.03762.pdf"  # Transformer paper

        try:
            text = await extract_text_from_pdf(public_pdf_url)
            print(f"✓ Extracted {len(text)} characters")
            print("First 200 chars:\n", text[:200], "...")

        except Exception as e:
            print(f"✗ Error: {e}")


if __name__ == "__main__":
    asyncio.run(run_tests())
