import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from src.core.logger import logger
from src.genai.schemas.hr_policy import DocumentChunk
from src.genai.llm_client import llm_client
from src.core.storage import storage_client
import uuid
import tempfile
import os


# GCS paths for Chroma DB
CHROMA_GCS_PATH = "chroma_db/"
CHROMA_LOCAL_TEMP = tempfile.mkdtemp()

COLLECTION_NAME = "hr_policies"


def download_chroma_from_gcs():
    try:
        logger.info("Downloading Chroma DB from GCS")
        
        blobs = storage_client.bucket.list_blobs(prefix=CHROMA_GCS_PATH)
        
        downloaded = 0
        for blob in blobs:
            relative_path = blob.name.replace(CHROMA_GCS_PATH, "")
            if not relative_path:
                continue
            
            local_path = os.path.join(CHROMA_LOCAL_TEMP, relative_path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            blob.download_to_filename(local_path)
            downloaded += 1
        
        if downloaded > 0:
            logger.info(f"Downloaded Chroma DB from GCS ({downloaded} files)")
        else:
            logger.info("No existing Chroma DB found in GCS (first time setup)")
            
    except Exception as e:
        logger.warning(f"Could not download Chroma DB from GCS: {e}")
        logger.info("Starting with fresh Chroma DB")


def upload_chroma_to_gcs():
    try:
        logger.info("Uploading Chroma DB to GCS...")
        
        uploaded = 0
        for root, dirs, files in os.walk(CHROMA_LOCAL_TEMP):
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, CHROMA_LOCAL_TEMP)
                gcs_path = f"{CHROMA_GCS_PATH}{relative_path}"
                
                blob = storage_client.bucket.blob(gcs_path)
                blob.upload_from_filename(local_path)
                uploaded += 1
        
        logger.info(f"Uploaded Chroma DB to GCS ({uploaded} files)")
        
    except Exception as e:
        logger.error(f"Failed to upload Chroma DB to GCS: {e}")


def get_chroma_client():
    return chromadb.PersistentClient(
        path=CHROMA_LOCAL_TEMP,
        settings=Settings(anonymized_telemetry=False)
    )


def get_collection():
    try:
        client = get_chroma_client()
        collection = client.get_collection(name=COLLECTION_NAME)
        logger.info(f" Retrieved existing collection: {COLLECTION_NAME}")
    except:
        client = get_chroma_client()
        collection = client.create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "HR policy documents"}
        )
        logger.info(f"Created new collection: {COLLECTION_NAME}")
    
    return collection


async def add_documents_to_chroma(chunks: List[DocumentChunk]) -> str:
    try:
        collection = get_collection()
        
        document_id = str(uuid.uuid4())
        
        ids = []
        documents = []
        metadatas = []
        embeddings = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}_chunk_{i}"
            ids.append(chunk_id)
            documents.append(chunk.text)
            
            chunk_metadata = chunk.metadata.copy()
            chunk_metadata["document_id"] = document_id
            metadatas.append(chunk_metadata)
            
            embedding = llm_client.generate_embedding(chunk.text)
            if embedding:
                embeddings.append(embedding)
            else:
                logger.warning(f"Failed to generate embedding for chunk {i}")
                embeddings.append([0.0] * 768)
        
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings
        )
        
        logger.info(f"Added {len(chunks)} chunks to Chroma (doc_id: {document_id})")
        
        # Sync to GCS
        upload_chroma_to_gcs()
        
        return document_id
        
    except Exception as e:
        logger.error(f"Failed to add documents to Chroma: {e}")
        raise


async def search_similar_documents(
    query: str,
    k: int = 3,
    category_filter: Optional[str] = None
) -> List[Dict]:
    try:
        collection = get_collection()
        
        query_embedding = llm_client.generate_embedding(query)
        if not query_embedding:
            logger.error("Failed to generate query embedding")
            return []
        
        where_filter = None
        if category_filter:
            where_filter = {"category": category_filter}
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where_filter
        )
        
        documents = []
        for i in range(len(results['ids'][0])):
            documents.append({
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "score": 1 - results['distances'][0][i] if 'distances' in results else 0.0
            })
        
        logger.info(f"Found {len(documents)} relevant documents")
        return documents
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return []


async def delete_document_from_chroma(document_id: str) -> bool:
    try:
        collection = get_collection()
        
        results = collection.get(where={"document_id": document_id})
        
        if results['ids']:
            collection.delete(ids=results['ids'])
            logger.info(f"Deleted document {document_id} ({len(results['ids'])} chunks)")
            
            upload_chroma_to_gcs()
            return True
        else:
            logger.warning(f"Document {document_id} not found")
            return False
            
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        return False


async def list_all_documents() -> List[Dict]:
    try:
        collection = get_collection()
        
        all_results = collection.get()
        
        documents = {}
        for metadata in all_results['metadatas']:
            doc_id = metadata.get('document_id')
            if doc_id and doc_id not in documents:
                documents[doc_id] = {
                    "document_id": doc_id,
                    "source": metadata.get('source'),
                    "category": metadata.get('category'),
                    "chunk_count": 0
                }
            
            if doc_id:
                documents[doc_id]["chunk_count"] += 1
        
        return list(documents.values())
        
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        return []