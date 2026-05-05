from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# CRYPTO

class JWKSchema(BaseModel):
    # From Web Crypto API
    kty: str
    crv: str
    x: str
    y: Optional[str] = None

class KDFSchema(BaseModel):
    name: str
    hash: str
    salt: str
    iterations: int

class EncryptedKeySchema(BaseModel):
    ciphertext: str
    iv: str

class CryptoRegistrationSchema(BaseModel):
    publicKey: JWKSchema
    encryptedPrivateKey: EncryptedKeySchema
    kdf: KDFSchema

# AUTHENTICATION

class UserRegister(BaseModel):
    email: EmailStr
    password: str # Hash in server side
    crypto: CryptoRegistrationSchema

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    token: str
    user: UserResponse
    crypto: CryptoRegistrationSchema

# CONVERSATIONS

class ConversationCreate(BaseModel):
    peerUserId: str

class ConversationResponse(BaseModel):
    id: str
    otherUser: UserResponse
    lastMessageAt: Optional[datetime] = None

    class Config:
        from_attributes = True

# MESSAGES

class MessagePayload(BaseModel):
    ciphertext: str
    iv: str
    timestamp: datetime
    mac: Optional[str] = None

class MessageCreate(BaseModel):
    payload: MessagePayload

class MessageResponse(BaseModel):
    id: str
    senderId: str
    receiverId: str
    payload: MessagePayload
    createdAt: datetime

    class Config:
        from_attributes = True

# WRAPPERS

class UserList(BaseModel):
    items: List[UserResponse]

class ConversationList(BaseModel):
    items: List[ConversationResponse]

class MessageList(BaseModel):
    items: List[MessageResponse]