import os
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin
from security.password import hash_password, verify_password
from security.jwt_core import sign

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
        
    hashed_pwd = hash_password(user_in.password)
    
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        password_salt="",
        public_key=user_in.crypto.publicKey,
        encrypted_private_key=user_in.crypto.encryptedPrivateKey,
        kdf_metadata=user_in.crypto.kdf
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"user": {"id": new_user.id, "email": new_user.email}}

@router.post("/login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        
    private_key = os.getenv("JWT_PRIVATE_KEY", "")
    header = {"alg": "ES256", "typ": "JWT"}
    claims = {
        "sub": str(user.id),
        "exp": int(time.time()) + 3600,
        "iat": int(time.time())
    }
    
    try:
        token = sign(header, claims, {}, private_key)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email
        },
        "crypto": {
            "publicKey": user.public_key,
            "encryptedPrivateKey": user.encrypted_private_key,
            "kdf": user.kdf_metadata
        }
    }