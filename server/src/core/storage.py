from google.oauth2 import service_account
from google.cloud import storage
from .config import Config
import uuid
from datetime import timedelta
from fastapi import UploadFile
from src.exceptions.base import FileTypeNotAllowedError, FileSizeExceededError

class StorageClient:
    def __init__(self):
        credentials = service_account.Credentials.from_service_account_info({
            "type": "service_account",
            "project_id": Config.GOOGLE_PROJECT_ID,
            "private_key": Config.GOOGLE_PRIVATE_KEY,
            "client_email": Config.GOOGLE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token"
        })

        self.client = storage.Client(
            credentials=credentials,
            project=Config.GOOGLE_PROJECT_ID
        )
        self.bucket = self.client.bucket(Config.GCS_BUCKET_NAME)

    def validate_file(self, file: UploadFile, allowed_types: list[str], max_size_mb: float = 5):
        ext = file.filename.split('.')[-1].lower()
        if f".{ext}" not in allowed_types:
            raise FileTypeNotAllowedError(f"File type .{ext} not allowed. Allowed: {allowed_types}")
        
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        if size > max_size_mb * 1024 * 1024:
            raise FileSizeExceededError(f"File size {size/1024/1024:.2f}MB exceeds {max_size_mb}MB limit")


    def upload(self, file: UploadFile, folder: str, expiration: int = 1):
        blob_name = f"{folder}/{uuid.uuid4()}-{file.filename}"
        blob = self.bucket.blob(blob_name)
        blob.upload_from_string(file.file.read(), content_type=file.content_type)
        url = blob.generate_signed_url(expiration=timedelta(days=expiration))
        return blob_name, url
    
    def get_url(self, blob_name: str, expiration: int = 1):
        blob = self.bucket.blob(blob_name)
        if not blob.exists():
            return None
        return blob.generate_signed_url(expiration=timedelta(days=expiration))
    

storage_client = StorageClient()