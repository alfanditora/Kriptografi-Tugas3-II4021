import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    
    password_hash = Column(Text, nullable=False)
    password_salt = Column(Text, nullable=False)

    public_key = Column(JSON, nullable=False)
    encrypted_private_key = Column(JSON, nullable=False)
    kdf_metadata = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relation
    conversations_a = relationship("Conversation", foreign_keys="[Conversation.user_a_id]", back_populates="user_a")
    conversations_b = relationship("Conversation", foreign_keys="[Conversation.user_b_id]", back_populates="user_b")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    
    user_a_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_b_id = Column(String, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relation
    user_a = relationship("User", foreign_keys=[user_a_id], back_populates="conversations_a")
    user_b = relationship("User", foreign_keys=[user_b_id], back_populates="conversations_b")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Payload
    ciphertext = Column(Text, nullable=False)
    iv = Column(Text, nullable=False)

    # Integrity (MAC)
    mac = Column(Text, nullable=True)

    client_timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relation
    conversation = relationship("Conversation", back_populates="messages")