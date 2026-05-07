import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import crud, schemas, models
from security.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Messages"])

# Send encrypted message
@router.post("/messages", response_model=dict)
def send_message(
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
    
    return {"messageId": str(new_msg.id)}

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