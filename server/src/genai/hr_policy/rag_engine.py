from typing import Dict, List, AsyncGenerator
from src.core.logger import logger
from src.genai.llm_client import llm_client
from src.genai.schemas.hr_policy import Message, RAGResult
from src.genai.hr_policy.vector_store import search_similar_documents
from src.genai.hr_policy.personalization import build_personalized_context


def build_rag_prompt(
    query: str,
    relevant_docs: List[Dict],
    user_info: Dict,
    conversation_history: List[Message],
    session_context: Dict
) -> str:
    
    system_instruction = """You are a helpful HR Policy Assistant for employees. Your role is to:
- Answer questions about company policies clearly and accurately
- Provide personalized answers based on employee context
- Cite sources when providing information
- Be concise but thorough
- Use a friendly, professional tone

IMPORTANT RULES:
- Always base answers on the provided policy documents
- If information is not in the documents, say so clearly
- Never make up policy information
- Personalize answers using employee context when relevant
"""
    
    employee_context = build_personalized_context(user_info)
    
    conversation_text = ""
    if conversation_history:
        conversation_text = "\n\nPREVIOUS CONVERSATION:\n"
        for msg in conversation_history[-3:]:
            conversation_text += f"{msg.role.upper()}: {msg.content}\n"
    
    topic_context = ""
    if session_context.get("current_topic"):
        topic_context = f"\n\nCURRENT TOPIC: {session_context['current_topic']}"
        topic_context += f"\nThe user is asking a follow-up question about {session_context['current_topic']}."
    
    documents_text = "\n\nRELEVANT POLICY DOCUMENTS:\n"
    for i, doc in enumerate(relevant_docs, 1):
        source = doc['metadata'].get('source', 'Unknown')
        category = doc['metadata'].get('category', 'general')
        documents_text += f"\n--- Document {i} (Source: {source}, Category: {category}) ---\n"
        documents_text += doc['content']
        documents_text += "\n"
    
    query_text = f"\n\nCURRENT QUESTION: {query}"
    
    instructions = """

Please provide a helpful, personalized answer based on:
1. The policy documents provided above
2. The employee's context (department, location, tenure, etc.)
3. The conversation history (if this is a follow-up question)

Format your response as:
- Direct answer to the question
- Cite the source document when providing specific policy details
- Personalize the answer using the employee's information
- Keep it concise but complete

Answer:"""
    
    complete_prompt = (
        system_instruction +
        "\n\nEMPLOYEE CONTEXT:\n" + employee_context +
        conversation_text +
        topic_context +
        documents_text +
        query_text +
        instructions
    )
    
    return complete_prompt


def extract_topic_from_query(query: str, answer: str) -> str:
    query_lower = query.lower() + " " + answer.lower()
    
    if any(word in query_lower for word in ['leave', 'vacation', 'pto', 'time off']):
        return "leave_policy"
    elif any(word in query_lower for word in ['salary', 'pay', 'payroll', 'gratuity', 'bonus']):
        return "payroll"
    elif any(word in query_lower for word in ['insurance', 'health', 'benefit', 'gym']):
        return "benefits"
    elif any(word in query_lower for word in ['wfh', 'work from home', 'remote', 'hybrid']):
        return "work_arrangement"
    elif any(word in query_lower for word in ['office', 'timing', 'hours']):
        return "office_policies"
    else:
        return "general"


async def generate_answer_streaming(
    query: str,
    user_info: Dict,
    conversation_history: List[Message],
    session_context: Dict
) -> AsyncGenerator[str, None]:
    try:
        logger.info(f"Searching for relevant documents for query: {query}")
        relevant_docs = await search_similar_documents(query, k=3)
        
        if not relevant_docs:
            yield "I couldn't find relevant policy documents to answer your question. Please contact HR for assistance."
            return
        
        prompt = build_rag_prompt(
            query=query,
            relevant_docs=relevant_docs,
            user_info=user_info,
            conversation_history=conversation_history,
            session_context=session_context
        )
        
        logger.info("Streaming answer from LLM...")
        async for chunk in llm_client.generate_text_streaming(prompt, temperature=0.7):
            yield chunk
        
        logger.info("Answer streamed successfully")
        
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        yield f"\n\nError: {str(e)}"


async def generate_answer(
    query: str,
    user_info: Dict,
    conversation_history: List[Message],
    session_context: Dict
) -> RAGResult:
    try:
        logger.info(f"Searching for relevant documents for query: {query}")
        relevant_docs = await search_similar_documents(query, k=3)
        
        if not relevant_docs:
            return RAGResult(
                answer="I couldn't find relevant policy documents to answer your question. Please contact HR for assistance.",
                sources=[],
                confidence=0.0,
                extracted_context={"current_topic": "unknown"}
            )
        
        prompt = build_rag_prompt(
            query=query,
            relevant_docs=relevant_docs,
            user_info=user_info,
            conversation_history=conversation_history,
            session_context=session_context
        )
        
        logger.info("Generating answer with LLM...")
        answer = llm_client.generate_text(prompt, temperature=0.7)
        
        avg_score = sum(doc['score'] for doc in relevant_docs) / len(relevant_docs)
        confidence = min(avg_score * 100, 100)
        
        topic = extract_topic_from_query(query, answer)
        
        sources = []
        for doc in relevant_docs:
            sources.append({
                "source": doc['metadata'].get('source', 'Unknown'),
                "category": doc['metadata'].get('category', 'general'),
                "relevance_score": doc['score']
            })
        
        logger.info(f"Answer generated (confidence: {confidence:.1f}%)")
        
        return RAGResult(
            answer=answer,
            sources=sources,
            confidence=confidence,
            extracted_context={
                "current_topic": topic,
                "timestamp": None
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        return RAGResult(
            answer=f"An error occurred while generating the answer: {str(e)}",
            sources=[],
            confidence=0.0,
            extracted_context={"current_topic": "error"}
        )