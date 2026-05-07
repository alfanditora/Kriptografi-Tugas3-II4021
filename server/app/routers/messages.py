import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List
from sse_starlette.sse import EventSourceResponse
import asyncio

from app.database import get_db
from app import crud, schemas, models
from security.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Messages"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[uuid.UUID, List[asyncio.Queue]] = {}

    def connect(self, user_id: uuid.UUID) -> asyncio.Queue:
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        q = asyncio.Queue()
        self.active_connections[user_id].append(q)
        return q

    def disconnect(self, user_id: uuid.UUID, q: asyncio.Queue):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(q)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            except ValueError:
                pass

    async def broadcast(self, user_id: uuid.UUID, message: dict):
        if user_id in self.active_connections:
            for q in self.active_connections[user_id]:
                await q.put(message)

manager = ConnectionManager()

# Send encrypted message
@router.post("/messages", response_model=dict)
async def send_message(
    message_data: schemas.MessageCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    logger.info(f"[MESSAGE] Send message request from {current_user.email}")
    logger.info(f"[MESSAGE] Receiver ID: {message_data.receiver_id}")
    logger.info(f"[MESSAGE] Ciphertext length: {len(message_data.ciphertext) if hasattr(message_data, 'ciphertext') else 'N/A'}")

    receiver = crud.get_user_by_id(db, message_data.receiver_id)
    if not receiver:
        logger.warning(f"[MESSAGE] Receiver not found: {message_data.receiver_id}")
        raise HTTPException(status_code=404, detail="Receiver not found")

    logger.info(f"[MESSAGE] Receiver found: {receiver.email}")
    new_msg = crud.create_message(
        db=db, 
        message=message_data, 
        sender_id=current_user.id
    )
    logger.info(f"[MESSAGE] Message created with ID: {new_msg.id}")
    
    # Broadcast to receiver and sender via SSE
    msg_data = schemas.MessageResponse.model_validate(new_msg)
    json_msg = jsonable_encoder(msg_data, by_alias=True)
    logger.info(f"[MESSAGE] Broadcasting to receiver {receiver.id}")
    await manager.broadcast(receiver.id, json_msg)
    logger.info(f"[MESSAGE] Broadcasting to sender {current_user.id}")
    await manager.broadcast(current_user.id, json_msg)
    logger.info(f"[MESSAGE] Broadcast complete")
    
    return {"messageId": str(new_msg.id)}

# SSE Stream
@router.get("/messages/stream")
async def message_stream(
    request: Request,
    current_user: models.User = Depends(get_current_user)
):
    logger.info(f"[SSE] Stream connection requested by user: {current_user.email}")
    logger.info(f"[SSE] Client IP: {request.client}")
    logger.info(f"[SSE] Request headers: {dict(request.headers)}")
    
    try:
        q = manager.connect(current_user.id)
        logger.info(f"[SSE] Connected user {current_user.email} to message queue")
        logger.info(f"[SSE] Active connections: {list(manager.active_connections.keys())}")

        async def event_generator():
            logger.info(f"[SSE] Event generator started for user {current_user.id}")
            try:
                while True:
                    if await request.is_disconnected():
                        logger.info(f"[SSE] Client disconnected: {current_user.email}")
                        break
                    
                    try:
                        message = await asyncio.wait_for(q.get(), timeout=1.0)
                        logger.debug(f"[SSE] Message received for {current_user.email}: {message}")
                        import json
                        yield {"data": json.dumps(message)}
                    except asyncio.TimeoutError:
                        logger.debug(f"[SSE] Timeout waiting for message for {current_user.email}")
                        pass
            except Exception as e:
                logger.error(f"[SSE] Error in event generator: {type(e).__name__}: {e}", exc_info=True)
            finally:
                logger.info(f"[SSE] Disconnecting user {current_user.email}")
                manager.disconnect(current_user.id, q)
                logger.info(f"[SSE] Active connections after disconnect: {list(manager.active_connections.keys())}")

        logger.info(f"[SSE] Returning EventSourceResponse for {current_user.email}")
        return EventSourceResponse(event_generator())
    except Exception as e:
        logger.error(f"[SSE] Error setting up stream: {type(e).__name__}: {e}", exc_info=True)
        raise

# Get chat history
@router.get("/messages/{user_id:uuid}", response_model=List[schemas.MessageResponse])
def get_chat_history(
    user_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # if not isinstance(user_id, uuid.UUID):
    #     raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    target_uuid = user_id

    messages = crud.get_messages_by_user(db, current_user.id, target_uuid)
    return messages

# Get user conversations
@router.get("/chats", response_model=List[schemas.ChatListResponse])
def get_user_conversations(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    chats = crud.get_user_chats(db, current_user.id)
    return chats

# Get user public key
@router.get("/users/{user_id}/public-key", response_model=schemas.PublicKeyResponse)
def get_user_public_key(
    user_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    user = crud.get_user_by_id(db, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "userId": user.id,
        "publicKey": user.public_key
    }

# Get all contacts
@router.get("/contacts", response_model=List[schemas.ContactResponse])
def get_contacts(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    contacts = crud.get_all_contacts(db, current_user.id)
    return contacts