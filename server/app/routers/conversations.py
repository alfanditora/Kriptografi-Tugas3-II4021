from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation
from security.dependencies import get_current_user
from sqlalchemy import or_, and_
from pydantic import BaseModel

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

class CreateConversationRequest(BaseModel):
    peerUserId: str # Di spec pake string 'usr_02'

@router.post("/")
def create_conversation(req: CreateConversationRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    peer = db.query(User).filter(User.id == req.peerUserId).first()
    if not peer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        
    conversation = db.query(Conversation).filter(
        or_(
            and_(Conversation.user_a_id == current_user.id, Conversation.user_b_id == req.peerUserId),
            and_(Conversation.user_a_id == req.peerUserId, Conversation.user_b_id == current_user.id)
        )
    ).first()
    
    if not conversation:
        conversation = Conversation(user_a_id=current_user.id, user_b_id=req.peerUserId)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
    return {"conversation": {
        "id": conversation.id, 
        "otherUser": {"id": peer.id, "email": peer.email}
    }}

@router.get("/{conversationId}/crypto")
def get_conversation_crypto(conversationId: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversationId).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        
    if conversation.user_a_id != current_user.id and conversation.user_b_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
    other_user_id = conversation.user_b_id if conversation.user_a_id == current_user.id else conversation.user_a_id
    other_user = db.query(User).filter(User.id == other_user_id).first()
    
    return {
        "otherUser": {
            "id": other_user.id,
            "email": other_user.email,
            "publicKey": other_user.public_key
        }
    }