from sqlalchemy.orm import Session
from . import models, schemas
import uuid

# USER

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserRegister, hashed_password: str, salt: str):
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        password_salt=salt,
        public_key=user.crypto.publicKey.dict(),
        encrypted_private_key=user.crypto.encryptedPrivateKey.dict(),
        kdf_metadata=user.crypto.kdf.dict()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users_except_me(db: Session, current_user_id: str):
    return db.query(models.User).filter(models.User.id != current_user_id).all()

# CONVERSATION

def get_conversation_between_users(db: Session, user_a_id: str, user_b_id: str):
    ids = sorted([user_a_id, user_b_id])
    return db.query(models.Conversation).filter(
        models.Conversation.user_a_id == ids[0],
        models.Conversation.user_b_id == ids[1]
    ).first()

def create_conversation(db: Session, user_a_id: str, user_b_id: str):
    ids = sorted([user_a_id, user_b_id])
    db_conv = models.Conversation(user_a_id=ids[0], user_b_id=ids[1])
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv

def get_user_conversations(db: Session, user_id: str):
    return db.query(models.Conversation).filter(
        (models.Conversation.user_a_id == user_id) | 
        (models.Conversation.user_b_id == user_id)
    ).all()

# MESSAGE

def create_message(db: Session, conversation_id: str, sender_id: str, receiver_id: str, payload: schemas.MessagePayload):
    db_msg = models.Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        ciphertext=payload.ciphertext,
        iv=payload.iv,
        mac=payload.mac,
        client_timestamp=payload.timestamp
    )
    db.add(db_msg)
    db.query(models.Conversation).filter(models.Conversation.id == conversation_id).update(
        {"updated_at": func.now()}
    )
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_messages_by_conversation(db: Session, conversation_id: str, since: str = None):
    query = db.query(models.Message).filter(models.Message.conversation_id == conversation_id)
    if since:
        query = query.filter(models.Message.created_at > since)
    return query.order_by(models.Message.created_at.asc()).all() 