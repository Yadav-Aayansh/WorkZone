import uuid
from typing import List, Dict, Optional
from src.core.redis import redis_client
from src.genai.schemas.hr_policy import ChatSession, Message
from src.utils.datetime import get_indian_time
from src.core.logger import logger


async def create_chat_session(user_info: Dict) -> str:
    chat_id = str(uuid.uuid4())
    
    session = ChatSession(
        chat_id=chat_id,
        user_info=user_info,
        messages=[],
        context={},
        created_at=get_indian_time().isoformat(),
        last_activity=get_indian_time().isoformat()
    )
    
    session_dict = session.model_dump(mode='json')
    await redis_client.set_session(
        f"hr_policy_chat:{chat_id}",
        session_dict,
        hours=24
    )
    
    logger.info(f"Created new chat session: {chat_id}")
    return chat_id

#get chat session from redis
async def get_chat_session(chat_id: str) -> Optional[ChatSession]:
    try:
        session_dict = await redis_client.get_session(f"hr_policy_chat:{chat_id}")
        if not session_dict:
            return None
        
        return ChatSession(**session_dict)
        
    except Exception as e:
        logger.error(f"Failed to get chat session: {e}")
        return None


async def update_chat_session(session: ChatSession) -> None:
    session.last_activity = get_indian_time().isoformat()
    session_dict = session.model_dump(mode='json')
    await redis_client.update_session(
        f"hr_policy_chat:{session.chat_id}",
        session_dict,
        hours=24
    )

#add message to chat session
async def add_message_to_chat(
    chat_id: str,
    role: str,
    content: str,
    metadata: Optional[Dict] = None
) -> None:
    session = await get_chat_session(chat_id)
    if not session:
        raise ValueError(f"Chat session {chat_id} not found")
    
    message = Message(
        role=role,
        content=content,
        timestamp=get_indian_time().isoformat(),
        metadata=metadata
    )
    
    session.messages.append(message)
    await update_chat_session(session)


async def get_conversation_history(chat_id: str, last_n: int = 5) -> List[Message]:
    session = await get_chat_session(chat_id)
    if not session:
        return []
    
    return session.messages[-last_n:]


async def update_chat_context(chat_id: str, context_updates: Dict) -> None:
    session = await get_chat_session(chat_id)
    if not session:
        raise ValueError(f"Chat session {chat_id} not found")
    
    session.context.update(context_updates)
    await update_chat_session(session)


async def get_chat_context(chat_id: str) -> Dict:
    session = await get_chat_session(chat_id)
    if not session:
        return {}
    
    return session.context