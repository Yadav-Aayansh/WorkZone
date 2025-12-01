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
import shutil


# GCS paths
CHROMA_GCS_BASE = "chroma_db/"
POLICIES_GCS_BASE = "policies/"

# Local temp directory for all tenant ChromaDBs
CHROMA_LOCAL_BASE = tempfile.mkdtemp()

COLLECTION_NAME = "hr_policies"


def get_tenant_chroma_local_path(chroma_db_path: str) -> str:
    tenant_folder = chroma_db_path.replace(CHROMA_GCS_BASE, "")
    return os.path.join(CHROMA_LOCAL_BASE, tenant_folder)


def download_all_tenant_chromadbs():
    try:
        logger.info("Downloading all tenant ChromaDBs from GCS...")
        
        blobs = storage_client.bucket.list_blobs(prefix=CHROMA_GCS_BASE)
        
        tenant_folders = set()
        downloaded = 0
        
        for blob in blobs:
            if not blob.name.startswith(CHROMA_GCS_BASE):
                continue
            
            relative_path = blob.name.replace(CHROMA_GCS_BASE, "")
            if not relative_path or relative_path.endswith('/'):
                continue
            
            # Extract tenant folder (e.g., amazon_uuid123)
            tenant_folder = relative_path.split('/')[0]
            tenant_folders.add(tenant_folder)
            
            local_path = os.path.join(CHROMA_LOCAL_BASE, relative_path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            blob.download_to_filename(local_path)
            downloaded += 1
        
        logger.info(
            f" Downloaded {len(tenant_folders)} tenant ChromaDBs "
            f"({downloaded} files) from GCS"
        )
        
        return list(tenant_folders)
        
    except Exception as e:
        logger.warning(f"Could not download tenant ChromaDBs from GCS: {e}")
        logger.info("Starting with empty ChromaDB base")
        return []


def download_chroma_from_gcs(chroma_db_path: str):
    try:
        logger.info(f"Downloading ChromaDB from GCS: {chroma_db_path}")
        
        blobs = storage_client.bucket.list_blobs(prefix=chroma_db_path)
        
        local_base = get_tenant_chroma_local_path(chroma_db_path)
        os.makedirs(local_base, exist_ok=True)
        
        downloaded = 0
        for blob in blobs:
            relative_path = blob.name.replace(chroma_db_path + "/", "")
            if not relative_path:
                continue
            
            local_path = os.path.join(local_base, relative_path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            blob.download_to_filename(local_path)
            downloaded += 1
        
        if downloaded > 0:
            logger.info(f"✓ Downloaded ChromaDB from {chroma_db_path} ({downloaded} files)")
        else:
            logger.info(f"No existing ChromaDB found at {chroma_db_path} (first time setup)")
            
    except Exception as e:
        logger.warning(f"Could not download ChromaDB from {chroma_db_path}: {e}")
        logger.info(f"Starting with fresh ChromaDB for {chroma_db_path}")


def upload_chroma_to_gcs(chroma_db_path: str):
    try:
        logger.info(f"Uploading ChromaDB to GCS: {chroma_db_path}")
        
        local_base = get_tenant_chroma_local_path(chroma_db_path)
        
        if not os.path.exists(local_base):
            logger.warning(f"Local ChromaDB not found at {local_base}")
            return
        
        uploaded = 0
        for root, dirs, files in os.walk(local_base):
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, local_base)
                gcs_path = f"{chroma_db_path}/{relative_path}"
                
                blob = storage_client.bucket.blob(gcs_path)
                blob.upload_from_filename(local_path)
                uploaded += 1
        
        logger.info(f" Uploaded ChromaDB to {chroma_db_path} ({uploaded} files)")
        
    except Exception as e:
        logger.error(f"Failed to upload ChromaDB to {chroma_db_path}: {e}")
        raise


def get_chroma_client(chroma_db_path: str):
    local_path = get_tenant_chroma_local_path(chroma_db_path)
    os.makedirs(local_path, exist_ok=True)
    
    return chromadb.PersistentClient(
        path=local_path,
        settings=Settings(anonymized_telemetry=False)
    )


def get_collection(chroma_db_path: str):
    try:
        client = get_chroma_client(chroma_db_path)
        collection = client.get_collection(name=COLLECTION_NAME)
        logger.info(f" Retrieved existing collection from {chroma_db_path}")
    except:
        client = get_chroma_client(chroma_db_path)
        collection = client.create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "HR policy documents"}
        )
        logger.info(f" Created new collection in {chroma_db_path}")
    
    return collection


async def add_documents_to_chroma(
    chunks: List[DocumentChunk],
    chroma_db_path: str,
    blob_name: str
) -> str:

    try:
        collection = get_collection(chroma_db_path)
        
        # Use blob_name as document_id
        document_id = blob_name
        
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
            chunk_metadata["blob_name"] = blob_name
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
        
        logger.info(
            f" Added {len(chunks)} chunks to {chroma_db_path} "
            f"(document_id: {document_id})"
        )
        
        # NOTE: Upload to GCS is called separately by the caller
        # to avoid uploading after every single document
        
        return document_id
        
    except Exception as e:
        logger.error(f"Failed to add documents to ChromaDB: {e}")
        raise


async def search_similar_documents(
    query: str,
    chroma_db_path: str,
    k: int = 3,
    category_filter: Optional[str] = None
) -> List[Dict]:
   
    try:
        collection = get_collection(chroma_db_path)
        
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


async def delete_document_from_chroma(
    chroma_db_path: str,
    blob_name: str
) -> bool:
    
    try:
        collection = get_collection(chroma_db_path)
        
        # Search by blob_name (which is the document_id)
        results = collection.get(where={"blob_name": blob_name})
        
        if results['ids']:
            collection.delete(ids=results['ids'])
            logger.info(
                f" Deleted document {blob_name} from {chroma_db_path} "
                f"({len(results['ids'])} chunks)"
            )
            
            # Upload updated ChromaDB to GCS
            upload_chroma_to_gcs(chroma_db_path)
            return True
        else:
            logger.warning(f"Document {blob_name} not found in {chroma_db_path}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        return False


async def list_all_documents(chroma_db_path: str) -> List[Dict]:
    try:
        collection = get_collection(chroma_db_path)
        
        all_results = collection.get()
        
        documents = {}
        for metadata in all_results['metadatas']:
            blob_name = metadata.get('blob_name')
            if blob_name and blob_name not in documents:
                documents[blob_name] = {
                    "document_id": blob_name,
                    "blob_name": blob_name,
                    "source": metadata.get('source'),
                    "category": metadata.get('category'),
                    "chunk_count": 0
                }
            
            if blob_name:
                documents[blob_name]["chunk_count"] += 1
        
        return list(documents.values())
        
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        return []


def create_tenant_chroma_path(tenant_name: str) -> str:
    tenant_uuid = str(uuid.uuid4())[:8]  # Short UUID
    return f"{CHROMA_GCS_BASE}{tenant_name}_{tenant_uuid}"