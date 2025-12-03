from typing import Dict, List, AsyncGenerator
from src.core.logger import logger
from src.genai.llm_client import llm_client
from src.genai.schemas.hr_policy import Message, RAGResult
from src.genai.hr_policy.vector_store import search_similar_documents
from src.genai.hr_policy.personalization import build_personalized_context
import json


def build_unified_rag_prompt(
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
- Generate relevant follow-up questions

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
    
    # Extract user info for personalization
    name = user_info.get("name") or user_info.get("employee_name") or "Employee"
    
    # Build leave balance info (flexible structure)
    leave_info = ""
    if "balance" in user_info and isinstance(user_info["balance"], dict):
        balances = []
        for leave_type, days in user_info["balance"].items():
            balances.append(f"{leave_type.title()}: {days} days")
        leave_info = ", ".join(balances)
    elif "leave_balance" in user_info:
        leave_info = f"{user_info['leave_balance']} days"
    
    # Determine if this is a leave-related query
    query_lower = query.lower()
    is_leave_query = any(word in query_lower for word in ['leave', 'vacation', 'pto', 'time off', 'holiday', 'absent'])
    
    instructions = f"""

Please provide a response in the following JSON format:
{{
    "answer": "Your personalized answer here",
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}}

ANSWER INSTRUCTIONS:
1. Provide a direct, helpful answer based on the policy documents
2. Cite the source document when providing specific policy details
3. PERSONALIZE the answer:
   - Start with greeting using employee name: {name}
   - {"Add their current leave balance at the end: " + leave_info if is_leave_query and leave_info else "Do NOT add leave balance (query is not about leaves)"}
   - Reference their role, department, or location ONLY if relevant to the query
   - Keep personalization natural and concise (1-2 sentences max)
4. Keep the answer complete but concise

SUGGESTIONS INSTRUCTIONS:
1. Generate EXACTLY 3 relevant follow-up questions based on:
   - The current answer and topic
   - Available policy documents
   - Employee context (role, department, tenure)
   - Conversation history
2. Questions should:
   - Build on what was just discussed
   - Be answerable from available policy documents
   - NOT repeat questions already asked in conversation
   - Be specific and actionable
3. Generate ONLY 3 suggestions, no more, no less

IMPORTANT: 
- Your ENTIRE response must be ONLY a valid JSON object
- DO NOT include any text outside the JSON
- DO NOT use markdown code blocks
- DO NOT add explanations before or after the JSON
- Generate EXACTLY 3 suggestions in the array

Your JSON response:"""
    
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


async def generate_answer(
    query: str,
    user_info: Dict,
    conversation_history: List[Message],
    session_context: Dict,
    chroma_db_path: str
) -> RAGResult:

    try:
        logger.info(f"Searching for relevant documents for query: {query}")
        relevant_docs = await search_similar_documents(
            query=query,
            chroma_db_path=chroma_db_path,
            k=3
        )
        
        if not relevant_docs:
            return RAGResult(
                answer="I couldn't find relevant policy documents to answer your question. Please contact HR for assistance.",
                sources=[],
                confidence=0.0,
                extracted_context={"current_topic": "unknown"},
                suggestions=[]
            )
        
        # Build unified prompt that handles everything
        prompt = build_unified_rag_prompt(
            query=query,
            relevant_docs=relevant_docs,
            user_info=user_info,
            conversation_history=conversation_history,
            session_context=session_context
        )
        
        logger.info("Generating unified response (answer + personalization + suggestions) with single LLM call...")
        response_text = llm_client.generate_text(prompt, temperature=0.7)
        
        # Parse JSON response
        try:
            # Clean up response (remove markdown code blocks if present)
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            response_json = json.loads(response_text)
            
            personalized_answer = response_json.get("answer", "")
            suggestions = response_json.get("suggestions", [])
            
            # Ensure exactly 3 suggestions
            if len(suggestions) > 3:
                suggestions = suggestions[:3]
            elif len(suggestions) < 3:
                # Pad with generic suggestions if needed
                while len(suggestions) < 3:
                    generic = [
                        "Can you explain more about this policy?",
                        "How does this apply to my department?",
                        "What are the exceptions to this rule?"
                    ]
                    suggestions.append(generic[len(suggestions)])
            
            logger.info("✓ Successfully parsed unified response")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response_text[:500]}")
            
            # Fallback: use the text as answer, generate basic suggestions
            personalized_answer = response_text
            suggestions = [
                "Can you explain more about this policy?",
                "How does this apply to my department?",
                "What are the exceptions to this rule?"
            ]
        
        # Calculate confidence
        avg_score = sum(doc['score'] for doc in relevant_docs) / len(relevant_docs)
        confidence = min(avg_score * 100, 100)
        
        # Extract topic
        topic = extract_topic_from_query(query, personalized_answer)
        
        # Build sources
        sources = []
        for doc in relevant_docs:
            sources.append({
                "source": doc['metadata'].get('source', 'Unknown'),
                "category": doc['metadata'].get('category', 'general'),
                "relevance_score": doc['score']
            })
        
        logger.info(f"✓ Generated answer + suggestions in single call (confidence: {confidence:.1f}%)")
        
        return RAGResult(
            answer=personalized_answer,
            sources=sources,
            confidence=confidence,
            extracted_context={
                "current_topic": topic,
                "timestamp": None
            },
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error generating answer: {e}")
        return RAGResult(
            answer=f"An error occurred while generating the answer: {str(e)}",
            sources=[],
            confidence=0.0,
            extracted_context={"current_topic": "error"},
            suggestions=[]
        )