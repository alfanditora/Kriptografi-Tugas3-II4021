from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from . import models, schemas
import uuid
from security.password import hash_password, generate_salt

# User CRUD

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: uuid.UUID):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_schema: schemas.UserRegister, hashed_password: str, salt: str):
    db_user = models.User(
        email=user_schema.email,
        password_hash=hashed_password,
        password_salt=salt,
        public_key=user_schema.public_key,
        encrypted_private_key=user_schema.encrypted_private_key,
        private_key_iv=user_schema.private_key_iv,
        private_key_kdf_salt=user_schema.private_key_kdf_salt
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_contacts(db: Session, current_user_id: uuid.UUID):
    return db.query(models.User).filter(models.User.id != current_user_id).all()

# Message & Conversation CRUD

def generate_conversation_key(user1_id: uuid.UUID, user2_id: uuid.UUID) -> str:
    ids = sorted([str(user1_id), str(user2_id)])
    return f"{ids[0]}:{ids[1]}"

def create_message(db: Session, message: schemas.MessageCreate, sender_id: uuid.UUID):
    conv_key = generate_conversation_key(sender_id, message.receiver_id)
    
    db_message = models.Message(
        conversation_key=conv_key,
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        ciphertext=message.ciphertext,
        iv=message.iv,
        mac=message.mac
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_user(db: Session, user1_id: uuid.UUID, user2_id: uuid.UUID):
    conv_key = generate_conversation_key(user1_id, user2_id)
    return db.query(models.Message).filter(
        models.Message.conversation_key == conv_key
    ).order_by(models.Message.created_at.asc()).all()

def get_user_chats(db: Session, current_user_id: uuid.UUID):
    last_messages = db.query(
        models.Message.conversation_key,
        func.max(models.Message.created_at).label("last_msg_at")
    ).filter(
        or_(
            models.Message.sender_id == current_user_id,
            models.Message.receiver_id == current_user_id
        )
    ).group_by(models.Message.conversation_key).subquery()

    results = db.query(models.User, last_messages.c.last_msg_at).join(
        models.Message, 
        models.Message.conversation_key == last_messages.c.conversation_key
    ).filter(
        and_(
            or_(models.Message.sender_id == models.User.id, models.Message.receiver_id == models.User.id),
            models.User.id != current_user_id
        )
    ).distinct().all()

    return [
        {
            "userId": user.id,
            "email": user.email,
            "lastMessageAt": last_msg_at
        } for user, last_msg_at in results
    ]