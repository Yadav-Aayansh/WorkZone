from typing import Dict, List
from src.core.logger import logger
from src.genai.hr_policy.personalization import get_user_category
from src.genai.llm_client import llm_client


BASE_SUGGESTIONS = {
    "leave": [
        "What's the annual leave policy?",
        "How do I apply for leave?",
        "Can I carry forward unused leaves?",
        "What's the sick leave policy?"
    ],
    "payroll": [
        "When is salary credited?",
        "How is gratuity calculated?",
        "What are my salary components?",
        "How is PF calculated?"
    ],
    "benefits": [
        "What health insurance benefits do we have?",
        "Are there gym membership benefits?",
        "What's the maternity/paternity leave policy?",
        "How do I enroll in benefits?"
    ],
    "policies": [
        "What's the work from home policy?",
        "What are office timings?",
        "What's the dress code?",
        "What's the notice period for resignation?"
    ]
}


FOLLOW_UP_SUGGESTIONS = {
    "leave_policy": [
        "How do I apply for leave?",
        "What about part-time employees?",
        "Can managers approve leaves instantly?",
        "What if I need emergency leave?",
        "How is leave balance calculated?"
    ],
    "payroll": [
        "When will I receive my payslip?",
        "How can I download Form 16?",
        "What deductions are there?",
        "How is overtime calculated?"
    ],
    "benefits": [
        "How do I enroll in insurance?",
        "What's covered under health insurance?",
        "Are dependents covered?",
        "How do I make a claim?"
    ],
    "work_arrangement": [
        "How many days can I work remotely?",
        "Do I need approval for WFH?",
        "What are the hybrid work guidelines?",
        "Can I work from another city?"
    ],
    "office_policies": [
        "Where is the office located?",
        "What are parking facilities?",
        "Is there a cafeteria?",
        "What are the security protocols?"
    ]
}


async def generate_initial_suggestions(user_info: Dict) -> Dict[str, List[str]]:
    suggestions = {
        "for_you": [],
        **BASE_SUGGESTIONS
    }
    
    # Get user category for better personalization
    user_category = get_user_category(user_info)
    
    # Personalization based on category
    if user_category == "new_employee":
        suggestions["for_you"].extend([
            "What's the probation period policy?",
            "When will I get my first salary?",
            "What documents do I need to submit?",
            "How do I access company systems?"
        ])
    elif user_category == "manager":
        suggestions["for_you"].extend([
            "How do I approve team leaves?",
            "What's the team appraisal process?",
            "How do I access team reports?"
        ])
    elif user_category == "senior":
        suggestions["for_you"].extend([
            "What long service awards are available?",
            "What's the sabbatical policy?"
        ])
    
    # Low leave balance
    leave_balance = user_info.get("leave_balance", 100)
    if leave_balance < 5:
        suggestions["for_you"].append(
            f"Your leave balance is low ({leave_balance} days). When do leaves refresh?"
        )
    
    # Location-specific
    location = user_info.get("location", "")
    if location:
        suggestions["for_you"].append(f"What are {location} office timings?")
    
    # Probation status
    if user_info.get("on_probation"):
        suggestions["for_you"].insert(0, "What policies apply during probation?")
    
    logger.info(f"✓ Generated initial suggestions with {len(suggestions['for_you'])} personalized items")
    return suggestions

# Enhanced Dynamic Suggestions - Using ChromaDB Content

async def generate_dynamic_contextual_suggestions(
    session_context: Dict,
    user_info: Dict,
    conversation_history: List,
    last_answer: str,
    chroma_db_path: str  # NEW PARAMETER
) -> List[str]:
    """
    Generate intelligent, context-aware follow-up suggestions using LLM
    Based on actual content available in ChromaDB
    """
    try:
        from src.genai.hr_policy.vector_store import search_similar_documents, list_all_documents
        
        current_topic = session_context.get("current_topic", "general")
        
        # Build conversation summary
        conversation_text = ""
        if conversation_history and len(conversation_history) >= 2:
            recent_messages = conversation_history[-6:]
            for msg in recent_messages:
                role = msg.role if hasattr(msg, 'role') else msg.get('role', 'unknown')
                content = msg.content if hasattr(msg, 'content') else msg.get('content', '')
                conversation_text += f"{role.upper()}: {content}\n"
        
        # Build user context
        user_context = f"""Employee: {user_info.get('name', 'Employee')}
Department: {user_info.get('department', 'N/A')}
Role: {user_info.get('designation', 'N/A')}
Manager: {user_info.get('is_manager', False)}
Leave Balance: {user_info.get('leave_balance', 'N/A')} days"""
        
        # ========== NEW: Get available documents from ChromaDB ==========
        try:
            # List all available documents
            all_docs = await list_all_documents(chroma_db_path)
            available_topics = set()
            for doc in all_docs:
                category = doc.get('category', 'general')
                source = doc.get('source', '')
                available_topics.add(category)
            
            # Search for related content based on current topic
            search_query = f"{current_topic} policy questions"
            related_docs = await search_similar_documents(
                query=search_query,
                chroma_db_path=chroma_db_path,
                k=5
            )
            
            # Extract snippets from related documents
            related_content = ""
            for i, doc in enumerate(related_docs[:3], 1):
                snippet = doc['content'][:200]  # First 200 chars
                related_content += f"\n{i}. {snippet}..."
            
            available_context = f"""
AVAILABLE POLICY DOCUMENTS:
Categories: {', '.join(available_topics)}

RELATED CONTENT FROM POLICIES:
{related_content}
"""
        except Exception as e:
            logger.warning(f"Could not fetch ChromaDB content: {e}")
            available_context = ""
        
        # Create enhanced prompt with ChromaDB content
        prompt = f"""Based on this HR conversation and AVAILABLE policy documents, suggest 3-5 relevant follow-up questions.

{user_context}

CONVERSATION:
{conversation_text}

LAST ANSWER:
{last_answer[:400]}

Current Topic: {current_topic}
{available_context}

IMPORTANT: Generate questions that can be answered using the AVAILABLE policy documents shown above.

Generate 3-5 follow-up questions that:
1. Build on what was discussed
2. Can be answered from available policy documents
3. DON'T repeat questions already asked
4. Are specific and actionable
5. Focus on topics in available categories

Format as numbered list only:
1. Question one
2. Question two
...

Your suggestions:"""

        # Generate suggestions using LLM
        logger.info("Generating dynamic suggestions with ChromaDB content...")
        response = llm_client.generate_text(prompt, temperature=0.7)
        
        # Parse the response
        suggestions = []
        lines = response.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                cleaned = line.lstrip('0123456789.-•) ').strip()
                if cleaned and len(cleaned) > 10:
                    suggestions.append(cleaned)
        
        # Fallback if insufficient suggestions
        if len(suggestions) < 3:
            logger.warning("LLM generated insufficient suggestions, using fallback")
            fallback = FOLLOW_UP_SUGGESTIONS.get(current_topic, []).copy()
            
            if current_topic == "leave_policy":
                if user_info.get("employee_type") == "Part-time":
                    fallback.insert(0, "How is pro-rated leave calculated for part-time employees?")
                if user_info.get("is_manager"):
                    fallback.append("How do I manage team leave calendars?")
            
            suggestions = fallback[:5]
        
        logger.info(f"✓ Generated {len(suggestions)} dynamic contextual suggestions based on ChromaDB content")
        return suggestions[:5]
        
    except Exception as e:
        logger.error(f"Error generating dynamic suggestions: {e}")
        return FOLLOW_UP_SUGGESTIONS.get(
            session_context.get("current_topic", "general"), 
            []
        )[:5]

async def generate_contextual_suggestions(
    session_context: Dict,
    user_info: Dict
) -> List[str]:
    """
    Legacy function for backward compatibility
    Uses static predetermined suggestions
    """
    current_topic = session_context.get("current_topic", "general")
    
    suggestions = FOLLOW_UP_SUGGESTIONS.get(current_topic, []).copy()
    
    # Add user-specific follow-ups
    if current_topic == "leave_policy":
        employee_type = user_info.get("employee_type", "Full-time")
        if employee_type == "Part-time":
            suggestions.insert(0, "How is pro-rated leave calculated for part-time employees?")
        
        if user_info.get("is_manager"):
            suggestions.append("How do I manage team leave calendars?")
    
    elif current_topic == "payroll":
        if user_info.get("tenure_years", 0) > 5:
            suggestions.insert(0, "What long service benefits am I eligible for?")
    
    elif current_topic == "benefits":
        if not user_info.get("health_insurance_enrolled"):
            suggestions.insert(0, "How do I enroll in health insurance?")
    
    logger.info(f"✓ Generated {len(suggestions)} contextual suggestions for topic: {current_topic}")
    return suggestions[:5]
