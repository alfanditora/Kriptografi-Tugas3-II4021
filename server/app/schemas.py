from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# Auth Schemas

class UserRegister(BaseModel):
    email: EmailStr
    password: str 
    public_key: str = Field(..., alias="publicKey")
    encrypted_private_key: str = Field(..., alias="encryptedPrivateKey")
    private_key_iv: str = Field(..., alias="privateKeyIv")
    private_key_kdf_salt: str = Field(..., alias="privateKeyKdfSalt")

    class Config:
        populate_by_name = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    id: UUID
    email: EmailStr
    encrypted_private_key: str = Field(..., alias="encryptedPrivateKey")
    private_key_iv: str = Field(..., alias="privateKeyIv")
    private_key_kdf_salt: str = Field(..., alias="privateKeyKdfSalt")

    class Config:
        populate_by_name = True

class LoginResponse(BaseModel):
    token: str
    user: LoginUser


# User & Contact Schemas

class ContactResponse(BaseModel):
    id: UUID
    email: EmailStr

    class Config:
        from_attributes = True


class PublicKeyResponse(BaseModel):
    user_id: UUID = Field(..., alias="userId")
    public_key: str = Field(..., alias="publicKey")

    class Config:
        populate_by_name = True


# Message Schemas

class MessageCreate(BaseModel):
    receiver_id: UUID = Field(..., alias="receiverId")
    ciphertext: str
    iv: str

    class Config:
        populate_by_name = True


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID = Field(..., alias="senderId")
    receiver_id: UUID = Field(..., alias="receiverId")
    ciphertext: str
    iv: str
    created_at: datetime = Field(..., alias="createdAt")

    class Config:
        from_attributes = True
        populate_by_name = True


# Conversation/Chat List Schemas

class ChatListResponse(BaseModel):
    user_id: UUID = Field(..., alias="userId")
    email: EmailStr
    last_message_at: datetime = Field(..., alias="lastMessageAt")

    class Config:
        populate_by_name = True