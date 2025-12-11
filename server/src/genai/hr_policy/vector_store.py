import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from src.core.logger import logger
from src.genai.schemas.hr_policy import DocumentChunk
from src.genai.llm_client import llm_client
from src.core.config import Config


# Single ChromaDB client instance (connected to server)
_chroma_client: Optional[chromadb.HttpClient] = None


def get_chroma_client() -> chromadb.HttpClient:
    """Get or create ChromaDB HttpClient connection."""
    global _chroma_client

    if _chroma_client is None:
        _chroma_client = chromadb.HttpClient(
            host=Config.CHROMA_HOST,
            port=Config.CHROMA_PORT,
            settings=Settings(anonymized_telemetry=False)
        )
        logger.info(f"Connected to ChromaDB server at {Config.CHROMA_HOST}:{Config.CHROMA_PORT}")

    return _chroma_client


def get_tenant_collection_name(chroma_db_path: str) -> str:
    """
    Convert chroma_db_path to collection name.
    Example: 'platform/chroma_db/tenant_uuid123' -> 'hr_policies_tenant_uuid123'
    """
    # Extract tenant identifier from path
    # Path format: platform/chroma_db/{tenant_id}
    tenant_id = chroma_db_path.rstrip('/').split('/')[-1]
    return f"hr_policies_{tenant_id}"


def get_collection(chroma_db_path: str):
    """Get or create collection for a tenant."""
    try:
        client = get_chroma_client()
        collection_name = get_tenant_collection_name(chroma_db_path)

        # get_or_create_collection handles both cases
        collection = client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "HR policy documents", "tenant_path": chroma_db_path}
        )
        logger.info(f"Using collection: {collection_name}")
        return collection

    except Exception as e:
        logger.error(f"Failed to get collection for {chroma_db_path}: {e}")
        raise


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
            f"Added {len(chunks)} chunks to collection "
            f"(document_id: {document_id})"
        )

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
                f"Deleted document {blob_name} "
                f"({len(results['ids'])} chunks)"
            )
            return True
        else:
            logger.warning(f"Document {blob_name} not found")
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
    """Create chroma_db_path for a tenant (kept for compatibility)."""
    return f"platform/chroma_db/{tenant_name}"


def delete_tenant_collection(chroma_db_path: str) -> bool:
    """Delete entire collection for a tenant (useful for cleanup)."""
    try:
        client = get_chroma_client()
        collection_name = get_tenant_collection_name(chroma_db_path)
        client.delete_collection(name=collection_name)
        logger.info(f"Deleted collection: {collection_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete collection: {e}")
        return False
