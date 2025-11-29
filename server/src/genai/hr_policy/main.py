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
    download_chroma_from_gcs,
    upload_chroma_to_gcs
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
    generate_contextual_suggestions
)

# call this func. at server start
async def initialize_system():
    logger.info("Initializing HR Policy Assistant system...")
    
    try:
        # Download Chroma DB from GCS
        download_chroma_from_gcs()
        
        # Test Chroma connection
        from src.genai.hr_policy.vector_store import get_collection
        collection = get_collection()
        count = collection.count()
        
        logger.info(f"System initialized - {count} documents in vector store")
        
        return {
            "status": "success",
            "message": f"System initialized with {count} documents"
        }
        
    except Exception as e:
        logger.error(f"System initialization failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

# DOCUMENT PROCESSING

async def process_uploaded_document(
    request: ProcessDocumentRequest
) -> ProcessDocumentResponse:
  
    start_time = time.time()
    logger.info(f"Processing document: {request.document_blob_name}")
    
    try:
        # Download PDF from GCS
        logger.info("Step 1: Downloading PDF from GCS...")
        pdf_bytes = await download_pdf_from_gcs(request.document_blob_name)
        
        # Extract text
        logger.info("Step 2: Extracting text from PDF...")
        text = extract_text_from_pdf(pdf_bytes)
        
        if not text.strip():
            raise ValueError("No text extracted from PDF")
        
        # Chunk text
        logger.info("Step 3: Chunking text...")
        filename = request.document_blob_name.split("/")[-1]
        chunks = chunk_text(
            text=text,
            source_filename=filename,
            category=request.category,
            metadata=request.metadata
        )
        
        # Add to Chroma
        logger.info("Step 4: Adding to Chroma vector store...")
        document_id = await add_documents_to_chroma(chunks)
        
        processing_time = time.time() - start_time
        logger.info(f" Document processed in {processing_time:.2f}s")
        
        return ProcessDocumentResponse(
            status="success",
            document_id=document_id,
            chunks_added=len(chunks),
            processing_time=processing_time,
            message=f"Successfully processed {len(chunks)} chunks from {filename}"
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Document processing failed: {str(e)}")
        
        return ProcessDocumentResponse(
            status="error",
            document_id="",
            chunks_added=0,
            processing_time=processing_time,
            message="Failed to process document",
            error=str(e)
        )


def _determine_category(blob_name: str, category_mapping: Optional[Dict] = None) -> str:
    if category_mapping:
        for folder, category in category_mapping.items():
            if f"/{folder}/" in blob_name or blob_name.startswith(f"{folder}/"):
                return category
    
    # Try folder structure
    parts = blob_name.split('/')
    if len(parts) >= 2:
        potential_category = parts[-2].lower()
        if potential_category in ['leave', 'payroll', 'benefits', 'policies']:
            return potential_category
    
    # Try filename
    filename = blob_name.split('/')[-1].lower()
    if 'leave' in filename or 'vacation' in filename:
        return 'leave'
    elif 'salary' in filename or 'payroll' in filename or 'gratuity' in filename:
        return 'payroll'
    elif 'benefit' in filename or 'insurance' in filename:
        return 'benefits'
    
    return 'policies'

#one time setup
async def process_all_documents_from_gcs(
    folder_path: str = "policies/",
    category_mapping: Optional[Dict[str, str]] = None
) -> Dict:
   
    logger.info(f"Starting bulk processing from GCS: {folder_path}")
    start_time = time.time()
    
    try:
        # List all PDFs
        logger.info("Step 1: Listing all PDFs in GCS...")
        bucket = storage_client.bucket
        blobs = bucket.list_blobs(prefix=folder_path)
        
        pdf_blobs = [blob for blob in blobs if blob.name.lower().endswith('.pdf')]
        total_files = len(pdf_blobs)
        
        logger.info(f"Found {total_files} PDF files in {folder_path}")
        
        if total_files == 0:
            return {
                "status": "success",
                "message": "No PDF files found",
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
        
        for i, blob in enumerate(pdf_blobs, 1):
            blob_name = blob.name
            logger.info(f"Processing [{i}/{total_files}]: {blob_name}")
            
            try:
                category = _determine_category(blob_name, category_mapping)
                
                result = await process_uploaded_document(
                    ProcessDocumentRequest(
                        document_blob_name=blob_name,
                        category=category,
                        metadata={
                            "bulk_processed": True,
                            "processed_at": get_indian_time().isoformat()
                        }
                    )
                )
                
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
                    logger.error(f"[{i}/{total_files}] Failed: {blob_name}")
                
            except Exception as e:
                failed += 1
                logger.error(f" [{i}/{total_files}] Error: {e}")
                results.append({
                    "blob_name": blob_name,
                    "status": "error",
                    "error": str(e)
                })
        
        processing_time = time.time() - start_time
        logger.info(
            f" Bulk processing complete: "
            f"{successful}/{total_files} successful "
            f"in {processing_time:.2f}s"
        )
        
        return {
            "status": "success",
            "message": f"Processed {total_files} files",
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
            "total_files": 0,
            "successful": 0,
            "failed": 0
        }


async def rebuild_chroma_from_gcs(folder_path: str = "policies/") -> Dict:
    logger.info("Rebuilding Chroma DB from scratch...")
    
    try:
        # Clear existing Chroma DB
        from src.genai.hr_policy.vector_store import CHROMA_LOCAL_TEMP
        import shutil
        
        if os.path.exists(CHROMA_LOCAL_TEMP):
            shutil.rmtree(CHROMA_LOCAL_TEMP)
            os.makedirs(CHROMA_LOCAL_TEMP)
            logger.info(" Cleared existing Chroma DB")
        
        # Process all documents
        result = await process_all_documents_from_gcs(folder_path)
        
        logger.info("Chroma DB rebuilt successfully")
        return result
        
    except Exception as e:
        logger.error(f" Failed to rebuild Chroma DB: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


async def delete_document(document_id: str) -> Dict:
    try:
        success = await delete_document_from_chroma(document_id)
        
        if success:
            return {
                "status": "success",
                "message": f"Document {document_id} deleted successfully"
            }
        else:
            return {
                "status": "error",
                "message": f"Document {document_id} not found"
            }
            
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

#To show admin dashboard, what are the policy files uploaded
async def list_documents() -> Dict:

    try:
        docs = await list_all_documents()
        return {
            "status": "success",
            "total_documents": len(docs),
            "documents": docs
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# CHAT FUNCTIONS

async def chat_with_context(request: ChatRequest) -> ChatResponse:
  
    start_time = time.time()
    logger.info(f"Chat request - chat_id: {request.chat_id}")
    logger.info(f"Query: {request.query}")
    
    try:
        # Session Management
        if not request.chat_id:
            logger.info("Creating new chat session...")
            chat_id = await create_chat_session(request.user_info)
            logger.info(f"New chat created: {chat_id}")
        else:
            chat_id = request.chat_id
            logger.info(f"Using existing chat: {chat_id}")
        
        # Get Conversation History
        logger.info("Retrieving conversation history...")
        history = await get_conversation_history(chat_id, last_n=5)
        logger.info(f" Retrieved {len(history)} previous messages")
        
        # Get Conversation Context
        logger.info("Getting conversation context...")
        session_context = await get_chat_context(chat_id)
        current_topic = session_context.get("current_topic", "none")
        logger.info(f" Current topic: {current_topic}")
        
        # Generate Answer with RAG
        logger.info("Generating answer with RAG...")
        rag_result = await generate_answer(
            query=request.query,
            user_info=request.user_info,
            conversation_history=history,
            session_context=session_context
        )
        confidence = rag_result.confidence
        logger.info(f" Answer generated (confidence: {confidence:.1f}%)")
        
        # Personalize Answer
        logger.info("Personalizing answer...")
        personalized_answer = await personalize_answer(
            raw_answer=rag_result.answer,
            user_info=request.user_info,
            query=request.query
        )
        logger.info("Answer personalized")
        
        # Save Messages
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
        logger.info("Messages saved")
        
        # Update Context
        logger.info("Updating conversation context...")
        context_update = rag_result.extracted_context
        context_update["timestamp"] = get_indian_time().isoformat()
        await update_chat_context(chat_id, context_update)
        new_topic = context_update.get("current_topic")
        logger.info(f"Context updated - new topic: {new_topic}")
        
        # Generate Suggestions
        logger.info("Generating follow-up suggestions...")
        suggestions = await generate_contextual_suggestions(
            session_context=rag_result.extracted_context,
            user_info=request.user_info
        )
        logger.info(f" Generated {len(suggestions)} suggestions")
        
        # Return Response
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


async def chat_with_context_streaming(
    request: ChatRequest
) -> AsyncGenerator[str, None]:

    try:
        # Session Management
        if not request.chat_id:
            chat_id = await create_chat_session(request.user_info)
        else:
            chat_id = request.chat_id
        
        # Get History & Context 
        history = await get_conversation_history(chat_id, last_n=5)
        session_context = await get_chat_context(chat_id)
        
        # Save User Message
        await add_message_to_chat(chat_id, "user", request.query)
        
        # Stream Answer Generation 
        # Get relevant documents for later use
        from src.genai.hr_policy.vector_store import search_similar_documents
        relevant_docs = await search_similar_documents(request.query, k=3)
        
        # Stream answer
        full_answer = ""
        async for chunk in generate_answer_streaming(
            query=request.query,
            user_info=request.user_info,
            conversation_history=history,
            session_context=session_context
        ):
            full_answer += chunk
            yield f"data: {chunk}\n\n"
        
        # Personalize Answer
        personalized_answer = await personalize_answer(
            raw_answer=full_answer,
            user_info=request.user_info,
            query=request.query
        )
        
        # If personalization added extra text, stream that too
        if len(personalized_answer) > len(full_answer):
            extra_text = personalized_answer[len(full_answer):]
            yield f"data: {extra_text}\n\n"
        
        # Save Assistant Message 
        # Calculate confidence
        if relevant_docs:
            avg_score = sum(doc['score'] for doc in relevant_docs) / len(relevant_docs)
            confidence = min(avg_score * 100, 100)
        else:
            confidence = 0.0
        
        # Format sources
        sources = []
        for doc in relevant_docs:
            sources.append({
                "source": doc['metadata'].get('source', 'Unknown'),
                "category": doc['metadata'].get('category', 'general'),
                "relevance_score": doc['score']
            })
        
        await add_message_to_chat(
            chat_id,
            "assistant",
            personalized_answer,
            metadata={
                "sources": sources,
                "confidence": confidence
            }
        )
        
        # Update Context 
        topic = extract_topic_from_query(request.query, full_answer)
        context_update = {
            "current_topic": topic,
            "timestamp": get_indian_time().isoformat()
        }
        await update_chat_context(chat_id, context_update)
        
        # Generate Suggestions
        suggestions = await generate_contextual_suggestions(
            session_context=context_update,
            user_info=request.user_info
        )
        
        # Send Metadata at End 
        metadata = {
            "type": "metadata",
            "chat_id": chat_id,
            "sources": sources,
            "suggestions": suggestions,
            "current_topic": topic,
            "confidence": confidence
        }
        yield f"data: [METADATA]{json.dumps(metadata)}\n\n"
        
        # Send completion signal
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        yield f"data: \n\nError: {str(e)}\n\n"
        yield "data: [DONE]\n\n"


# suggestions for homepage

async def get_suggestions(request: SuggestionsRequest) -> SuggestionsResponse:
    logger.info("Generating suggestions...")
    
    try:
        # Generate initial suggestions
        suggestions = await generate_initial_suggestions(request.user_info)
        
        # Get trending questions
        # trending = await get_trending_questions(top_n=5)
        
        # If chat_id provided, add contextual suggestions
        if request.chat_id:
            session_context = await get_chat_context(request.chat_id)
            if session_context:
                contextual = await generate_contextual_suggestions(
                    session_context=session_context,
                    user_info=request.user_info
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
            },
            # trending=trending
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
            },
            # trending=[]
        )


#Retrieve complete conversation from Redis for display/analysis.
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
    "process_all_documents_from_gcs",
    "rebuild_chroma_from_gcs",
    "delete_document",
    "list_documents",
    
    # Chat functions
    "chat_with_context",
    "chat_with_context_streaming",
    
    # Suggestions
    "get_suggestions",
    
    # Utility
    "get_chat_history",
]