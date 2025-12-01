import asyncio
from src.core.celery import worker
from src.genai.hr_policy import (
    process_all_documents_from_gcs, process_multiple_documents, delete_document
)
from src.genai.schemas import ProcessDocumentRequest


@worker.task(bind=True, max_retries=3)
def set_docs(self, tenant_folder_path: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_all_documents_from_gcs(tenant_folder_path))
    finally:
        loop.close()

@worker.task(bind=True, max_retries=3)
def append_docs(self, chroma_db_path: str, docs: list[str]):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        request = ProcessDocumentRequest(chroma_db_path=chroma_db_path, document_blob_names=docs)
        loop.run_until_complete(process_multiple_documents(request))
    finally:
        loop.close()
    

@worker.task(bind=True, max_retries=3)
def delete_doc(self, chroma_db_path: str, doc: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(delete_document(chroma_db_path, doc))
    finally:
        loop.close()