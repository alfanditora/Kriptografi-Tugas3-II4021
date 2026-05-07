import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List
from sse_starlette.sse import EventSourceResponse
import asyncio

from app.database import get_db
from app import crud, schemas, models
from security.dependencies import get_current_user

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

    receiver = crud.get_user_by_id(db, message_data.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    new_msg = crud.create_message(
        db=db, 
        message=message_data, 
        sender_id=current_user.id
    )
    
    # Broadcast to receiver and sender via SSE
    msg_data = schemas.MessageResponse.model_validate(new_msg)
    json_msg = jsonable_encoder(msg_data, by_alias=True)
    await manager.broadcast(receiver.id, json_msg)
    await manager.broadcast(current_user.id, json_msg)
    
    return {"messageId": str(new_msg.id)}

# SSE Stream
@router.get("/messages/stream")
async def message_stream(
    request: Request,
    current_user: models.User = Depends(get_current_user)
):
    q = manager.connect(current_user.id)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                try:
                    message = await asyncio.wait_for(q.get(), timeout=1.0)
                    import json
                    yield {"data": json.dumps(message)}
                except asyncio.TimeoutError:
                    pass
        finally:
            manager.disconnect(current_user.id, q)

    return EventSourceResponse(event_generator())

# Get chat history
@router.get("/messages/{user_id}", response_model=List[schemas.MessageResponse])
def get_chat_history(
    user_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

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