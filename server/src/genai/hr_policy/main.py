from typing import Dict, Optional, AsyncGenerator, List
import time
import os
import json
from src.core.logger import logger
from src.utils.datetime import get_indian_time
from src.core.storage import storage_client

# Schemas
from src.genai.schemas.hr_policy import (
    ProcessDocumentRequest,
    ProcessDocumentResponse,
    ChatRequest,
    ChatResponse,
    SuggestionsRequest,
    SuggestionsResponse
)

# Core modules
from src.genai.hr_policy.document_processor import (
    download_pdf_from_gcs,
    extract_text_from_pdf,
    chunk_text
)
from src.genai.hr_policy.vector_store import (
    add_documents_to_chroma,
    delete_document_from_chroma,
    list_all_documents,
    download_all_tenant_chromadbs,
    download_chroma_from_gcs,
    upload_chroma_to_gcs,
    create_tenant_chroma_path
)
from src.genai.hr_policy.context_manager import (
    create_chat_session,
    get_chat_session,
    add_message_to_chat,
    get_conversation_history,
    get_chat_context,
    update_chat_context
)
from src.genai.hr_policy.rag_engine import (
    generate_answer,
    generate_answer_streaming,
    extract_topic_from_query
)
from src.genai.hr_policy.personalization import personalize_answer
from src.genai.hr_policy.suggestions_generator import (
    generate_initial_suggestions,
    generate_contextual_suggestions,
    generate_dynamic_contextual_suggestions
)


async def initialize_system():
    logger.info("Initializing HR Policy Assistant system (multi-tenant)...")
    
    try:
        # Download all tenant ChromaDBs from GCS
        tenant_folders = download_all_tenant_chromadbs()
        
        logger.info(
            f" System initialized - "
            f"{len(tenant_folders)} tenant ChromaDBs downloaded"
        )
        
        return {
            "status": "success",
            "message": f"System initialized with {len(tenant_folders)} tenants",
            "tenants": tenant_folders
        }
        
    except Exception as e:
        logger.error(f" System initialization failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


def _determine_category(blob_name: str, category_override: Optional[str] = None) -> str:
    if category_override:
        return category_override
    
    # Auto-detect from filename
    blob_lower = blob_name.lower()
    
    if any(word in blob_lower for word in ['leave', 'vacation', 'pto', 'time_off']):
        return "leave"
    elif any(word in blob_lower for word in ['payroll', 'salary', 'pay', 'compensation']):
        return "payroll"
    elif any(word in blob_lower for word in ['benefit', 'insurance', 'health', 'wellness']):
        return "benefits"
    else:
        return "policies"


async def process_uploaded_document(
    request: ProcessDocumentRequest,
    blob_name: str
) -> ProcessDocumentResponse:
    
    start_time = time.time()
    
    try:
        logger.info(f"Processing document: {blob_name} for {request.chroma_db_path}")
        
        # Step 1: Download PDF from GCS
        logger.info("Step 1: Downloading PDF from GCS...")
        local_pdf_path = await download_pdf_from_gcs(blob_name)
        logger.info(f" Downloaded to {local_pdf_path}")
        
        # Step 2: Extract text
        logger.info("Step 2: Extracting text from PDF...")
        text = extract_text_from_pdf(local_pdf_path)
        logger.info(f" Extracted {len(text)} characters")
        
        # Step 3: Chunk text
        logger.info("Step 3: Chunking text...")
        category = _determine_category(blob_name, request.category)
        
        chunks = chunk_text(
            text=text,
            source=os.path.basename(blob_name),
            category=category,
            metadata=request.metadata or {}
        )
        logger.info(f" Created {len(chunks)} chunks")
        
        # Step 4: Add to ChromaDB
        logger.info(f"Step 4: Adding to ChromaDB ({request.chroma_db_path})...")
        document_id = await add_documents_to_chroma(
            chunks=chunks,
            chroma_db_path=request.chroma_db_path,
            blob_name=blob_name
        )
        logger.info(f" Added to ChromaDB (document_id: {document_id})")
        
        # Clean up temp file
        if os.path.exists(local_pdf_path):
            os.remove(local_pdf_path)
        
        processing_time = time.time() - start_time
        logger.info(f" Document processed in {processing_time:.2f}s")
        
        return ProcessDocumentResponse(
            status="success",
            document_id=document_id,
            blob_name=blob_name,
            chunks_added=len(chunks),
            processing_time=processing_time,
            message=f"Document {blob_name} processed successfully"
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f" Document processing failed: {e}")
        
        return ProcessDocumentResponse(
            status="error",
            document_id=blob_name,
            blob_name=blob_name,
            chunks_added=0,
            processing_time=processing_time,
            message=f"Failed to process {blob_name}",
            error=str(e)
        )


async def process_multiple_documents(
    request: ProcessDocumentRequest
) -> Dict:

    start_time = time.time()
    
    if not request.document_blob_names:
        return {
            "status": "error",
            "message": "document_blob_names is required"
        }
    
    logger.info(
        f"Processing {len(request.document_blob_names)} documents "
        f"for {request.chroma_db_path}"
    )
    
    try:
        # Download existing ChromaDB
        download_chroma_from_gcs(request.chroma_db_path)
        
        results = []
        successful = 0
        failed = 0
        
        for i, blob_name in enumerate(request.document_blob_names, 1):
            logger.info(f"Processing [{i}/{len(request.document_blob_names)}]: {blob_name}")
            
            try:
                result = await process_uploaded_document(request, blob_name)
                
                results.append({
                    "blob_name": blob_name,
                    "status": result.status,
                    "document_id": result.document_id,
                    "chunks_added": result.chunks_added
                })
                
                if result.status == "success":
                    successful += 1
                    logger.info(f" [{i}/{len(request.document_blob_names)}] Success: {blob_name}")
                else:
                    failed += 1
                    logger.error(f" [{i}/{len(request.document_blob_names)}] Failed: {blob_name}")
                
            except Exception as e:
                failed += 1
                logger.error(f"✗ [{i}/{len(request.document_blob_names)}] Error: {e}")
                results.append({
                    "blob_name": blob_name,
                    "status": "error",
                    "error": str(e)
                })
        
        # Upload ChromaDB to GCS ONCE after all documents
        logger.info("Uploading updated ChromaDB to GCS...")
        upload_chroma_to_gcs(request.chroma_db_path)
        
        processing_time = time.time() - start_time
        logger.info(
            f"Processed {len(request.document_blob_names)} documents: "
            f"{successful} successful, {failed} failed in {processing_time:.2f}s"
        )
        
        return {
            "status": "success",
            "message": f"Processed {len(request.document_blob_names)} documents",
            "chroma_db_path": request.chroma_db_path,
            "total_documents": len(request.document_blob_names),
            "successful": successful,
            "failed": failed,
            "processing_time": processing_time,
            "results": results
        }
        
    except Exception as e:
        logger.error(f" Bulk processing failed: {e}")
        return {
            "status": "error",
            "message": str(e),
            "chroma_db_path": request.chroma_db_path
        }


async def process_all_documents_from_gcs(
    tenant_folder_path: str,
    category_mapping: Optional[Dict[str, str]] = None
) -> Dict:
   
    start_time = time.time()
    
    try:
        # Extract tenant name from path
        tenant_name = tenant_folder_path.rstrip('/').split('/')[-1]
        logger.info(f"Processing all documents for tenant: {tenant_name}")
        
        # Create ChromaDB path for this tenant
        chroma_db_path = create_tenant_chroma_path(tenant_name)
        logger.info(f"Created ChromaDB path: {chroma_db_path}")
        
        # List all PDFs in tenant folder
        logger.info(f"Step 1: Listing all PDFs in {tenant_folder_path}")
        bucket = storage_client.bucket
        blobs = bucket.list_blobs(prefix=tenant_folder_path)
        
        pdf_blobs = [
            blob for blob in blobs 
            if blob.name.lower().endswith('.pdf')
        ]
        total_files = len(pdf_blobs)
        
        logger.info(f" Found {total_files} PDF files in {tenant_folder_path}")
        
        if total_files == 0:
            return {
                "status": "success",
                "message": "No PDF files found",
                "chroma_db_path": chroma_db_path,
                "total_files": 0,
                "successful": 0,
                "failed": 0,
                "results": []
            }
        
        # Process each PDF
        logger.info("Step 2: Processing all PDFs...")
        results = []
        successful = 0
        failed = 0
        
        # Create request object for this tenant
        request = ProcessDocumentRequest(
            chroma_db_path=chroma_db_path,
            category=None,  # Auto-detect
            metadata={
                "tenant": tenant_name,
                "bulk_processed": True,
                "processed_at": get_indian_time().isoformat()
            }
        )
        
        for i, blob in enumerate(pdf_blobs, 1):
            blob_name = blob.name
            logger.info(f"Processing [{i}/{total_files}]: {blob_name}")
            
            try:
                result = await process_uploaded_document(request, blob_name)
                
                results.append({
                    "blob_name": blob_name,
                    "status": result.status,
                    "document_id": result.document_id,
                    "chunks_added": result.chunks_added
                })
                
                if result.status == "success":
                    successful += 1
                    logger.info(f"[{i}/{total_files}] Success: {blob_name}")
                else:
                    failed += 1
                    logger.error(f" [{i}/{total_files}] Failed: {blob_name}")
                
            except Exception as e:
                failed += 1
                logger.error(f"[{i}/{total_files}] Error: {e}")
                results.append({
                    "blob_name": blob_name,
                    "status": "error",
                    "error": str(e)
                })
        
        # Upload ChromaDB to GCS ONCE after all documents
        logger.info(f"Step 3: Uploading ChromaDB to {chroma_db_path}")
        upload_chroma_to_gcs(chroma_db_path)
        
        processing_time = time.time() - start_time
        logger.info(
            f" Bulk processing complete: "
            f"{successful}/{total_files} successful "
            f"in {processing_time:.2f}s"
        )
        
        return {
            "status": "success",
            "message": f"Processed {total_files} files for tenant {tenant_name}",
            "chroma_db_path": chroma_db_path,
            "tenant": tenant_name,
            "total_files": total_files,
            "successful": successful,
            "failed": failed,
            "processing_time": processing_time,
            "results": results
        }
        
    except Exception as e:
        logger.error(f" Bulk processing failed: {e}")
        return {
            "status": "error",
            "message": str(e),
            "tenant_folder_path": tenant_folder_path
        }
    


async def delete_document(
    chroma_db_path: str,
    blob_name: str
) -> Dict:
    try:
        success = await delete_document_from_chroma(chroma_db_path, blob_name)
        
        if success:
            return {
                "status": "success",
                "message": f"Document {blob_name} deleted successfully from {chroma_db_path}"
            }
        else:
            return {
                "status": "error",
                "message": f"Document {blob_name} not found in {chroma_db_path}"
            }
            
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


# #To show admin dashboard, what are the policy files uploaded
async def list_documents(chroma_db_path: str) -> List[Dict]:
    try:
        documents = await list_all_documents(chroma_db_path)
        return documents
        
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        return []


async def chat_with_context(request: ChatRequest) -> ChatResponse:
    start_time = time.time()
    
    try:
        # Session Management
        logger.info(f"Chat request - chat_id: {request.chat_id}")
        logger.info(f"Query: {request.query}")
        logger.info(f"ChromaDB path: {request.chroma_db_path}")
        
        if not request.chat_id:
            chat_id = await create_chat_session(request.user_info)
            logger.info(f"Created new chat: {chat_id}")
        else:
            chat_id = request.chat_id
            logger.info(f"Using existing chat: {chat_id}")
        
        # Get Conversation History 
        logger.info("Retrieving conversation history...")
        history = await get_conversation_history(chat_id, last_n=5)
        logger.info(f" Retrieved {len(history)} previous messages")
        
        #Get Conversation Context
        logger.info("Getting conversation context...")
        session_context = await get_chat_context(chat_id)
        current_topic = session_context.get("current_topic", "none")
        logger.info(f"Current topic: {current_topic}")
        
        # generate ans with rag
        logger.info("Generating answer with RAG...")
        rag_result = await generate_answer(
            query=request.query,
            user_info=request.user_info,
            conversation_history=history,
            session_context=session_context,
            chroma_db_path=request.chroma_db_path  
        )
        confidence = rag_result.confidence
        logger.info(f" Answer generated (confidence: {confidence:.1f}%)")
        
        #personlaize answer
        logger.info("Personalizing answer...")
        personalized_answer = await personalize_answer(
            raw_answer=rag_result.answer,
            user_info=request.user_info,
            query=request.query
        )
        logger.info("Answer personalized")
        
        # save messages
        logger.info("Saving messages to Redis...")
        await add_message_to_chat(chat_id, "user", request.query)
        await add_message_to_chat(
            chat_id,
            "assistant",
            personalized_answer,
            metadata={
                "sources": rag_result.sources,
                "confidence": rag_result.confidence
            }
        )
        logger.info(" Messages saved")
        
        # update context
        logger.info("Updating conversation context...")
        context_update = rag_result.extracted_context
        context_update["timestamp"] = get_indian_time().isoformat()
        await update_chat_context(chat_id, context_update)
        new_topic = context_update.get("current_topic")
        logger.info(f"Context updated - new topic: {new_topic}")
        
        # generate suggestions
        logger.info("Generating follow-up suggestions...")
        # suggestions = await generate_contextual_suggestions(
        #     session_context=rag_result.extracted_context,
        #     user_info=request.user_info
        #     # conversation_history=history,
        #     # last_answer=personalized_answer
        # )

        suggestions = await generate_dynamic_contextual_suggestions(
            session_context=context_update,
            user_info=request.user_info,
            conversation_history=history,
            last_answer=personalized_answer,
            chroma_db_path=request.chroma_db_path
        )
        logger.info(f"Generated {len(suggestions)} suggestions")
        
        # return responses
        processing_time = time.time() - start_time
        logger.info(f"Chat completed in {processing_time:.2f}s")
        
        return ChatResponse(
            chat_id=chat_id,
            answer=personalized_answer,
            sources=rag_result.sources,
            suggestions=suggestions,
            current_topic=new_topic,
            confidence=rag_result.confidence
        )
        
    except Exception as e:
        logger.error(f"Chat workflow failed: {str(e)}", exc_info=True)
        
        return ChatResponse(
            chat_id=request.chat_id or "error",
            answer=(
                "I'm sorry, I encountered an error processing your request. "
                "Please try again or contact HR support."
            ),
            sources=[],
            suggestions=[],
            current_topic=None,
            confidence=0.0
        )


#suggestion for homepage
async def get_suggestions(request: SuggestionsRequest) -> SuggestionsResponse:
    logger.info("Generating suggestions...")
    
    try:
        # Generate initial suggestions
        suggestions = await generate_initial_suggestions(request.user_info)
        
        # If chat_id provided, add contextual suggestions
        if request.chat_id:
            session_context = await get_chat_context(request.chat_id)
            if session_context:
                # conv_history = await get_conversation_history(request.chat_id, last_n=6)
                
                contextual = await generate_contextual_suggestions(
                    session_context=session_context,
                    user_info=request.user_info
                    # conversation_history=conv_history,
                    # last_answer=""
                )
                suggestions["contextual"] = contextual
        
        user_name = request.user_info.get("name", "Employee")
        logger.info(f" Generated suggestions for {user_name}")
        
        return SuggestionsResponse(
            for_you=suggestions.get("for_you", []),
            categories={
                "leave": suggestions.get("leave", []),
                "payroll": suggestions.get("payroll", []),
                "benefits": suggestions.get("benefits", []),
                "policies": suggestions.get("policies", [])
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate suggestions: {e}")
        
        return SuggestionsResponse(
            for_you=[],
            categories={
                "leave": ["What's the leave policy?"],
                "payroll": ["When is salary credited?"],
                "benefits": ["What insurance benefits do we have?"],
                "policies": ["What's the WFH policy?"]
            }
        )


#Retrieve complete conversation from Redis for display/analysis on dashboard
async def get_chat_history(chat_id: str) -> Dict:
    try:
        session = await get_chat_session(chat_id)
        if not session:
            return {
                "status": "error",
                "message": "Chat session not found"
            }
        
        return {
            "status": "success",
            "chat_id": chat_id,
            "user_info": session.user_info,
            "messages": [msg.model_dump() for msg in session.messages],
            "context": session.context,
            "created_at": session.created_at,
            "last_activity": session.last_activity
        }
        
    except Exception as e:
        logger.error(f"Failed to get chat history: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


__all__ = [
    # Initialization
    "initialize_system",
    
    # Document processing
    "process_uploaded_document",
    "process_multiple_documents",
    "process_all_documents_from_gcs",
    "delete_document",
    "list_documents",
    
    # Chat functions
    "chat_with_context"
    # "chat_with_context_streaming",
    
    # Suggestions
    "get_suggestions",
    
    # Utility
    "get_chat_history",
]