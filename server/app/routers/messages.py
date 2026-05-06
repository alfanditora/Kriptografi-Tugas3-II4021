from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation, Message
from security.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/conversations/{conversationId}/messages", tags=["messages"])

class MacPayload(BaseModel):
    alg: str
    value: str

class MessagePayload(BaseModel):
    ciphertext: str
    iv: str
    alg: str
    timestamp: str
    mac: MacPayload

class SendMessageRequest(BaseModel):
    payload: MessagePayload

@router.post("/")
def send_message(conversationId: str, req: SendMessageRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversationId).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        
    if conversation.user_a_id != current_user.id and conversation.user_b_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
    receiver_id = conversation.user_b_id if conversation.user_a_id == current_user.id else conversation.user_a_id
    
    msg = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        ciphertext=req.payload.ciphertext,
        iv=req.payload.iv,
        client_timestamp=datetime.fromisoformat(req.payload.timestamp.replace("Z", "+00:00")),
        mac_value=req.payload.mac.value
    )
    
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    return {"message": {"id": msg.id, "conversationId": conversation.id}}

@router.get("/")
def get_messages(conversationId: str, since: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversationId).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        
    if conversation.user_a_id != current_user.id and conversation.user_b_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
    query = db.query(Message).filter(Message.conversation_id == conversationId)
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
            query = query.filter(Message.created_at > since_dt)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp format")
            
    messages = query.order_by(Message.created_at.asc()).all()
    
    result = []
    for m in messages:
        result.append({
            "id": m.id,
            "senderId": m.sender_id,
            "receiverId": m.receiver_id,
            "payload": {
                "ciphertext": m.ciphertext,
                "iv": m.iv,
                "alg": "AES-256-GCM",
                "timestamp": m.client_timestamp.isoformat() + "Z" if m.client_timestamp else None,
                "mac": {
                    "alg": "HMAC-SHA256",
                    "value": m.mac_value
                }
            },
            "createdAt": m.created_at.isoformat() + "Z" if m.created_at else None
        })
        
    return {"items": result}