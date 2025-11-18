from src.core.storage import storage_client

from google.api_core import exceptions as google_exceptions

def download_blob(blob_name):
    """Downloads a blob from GCS.

    Raises:
        FileNotFoundError: If the specified blob_name does not exist.
    """
    blob = storage_client.bucket.blob(blob_name)
    
    try:
        return blob.download_as_bytes()
    
    except google_exceptions.NotFound:
        raise FileNotFoundError(f"Could not find ({blob_name}) in GCS bucket")