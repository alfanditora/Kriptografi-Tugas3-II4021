import os
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from security.password import verify_password, hash_password, generate_salt
from security.jwt_core import sign

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

JWT_PRIVATE_KEY = os.getenv("JWT_PRIVATE_KEY", "")

# Register new user
@router.post("/register", response_model=dict)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    logger.info(f"[AUTH] Register attempt for email: {user_data.email}")

    db_user = crud.get_user_by_email(db, email=user_data.email)
    if db_user:
        logger.warning(f"[AUTH] Email already registered: {user_data.email}")
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    salt = generate_salt()
    hashed_password = hash_password(user_data.password, salt)
    logger.debug(f"[AUTH] Password hashed for {user_data.email}")
    
    crud.create_user(
        db=db, 
        user_schema=user_data, 
        hashed_password=hashed_password, 
        salt=salt
    )
    logger.info(f"[AUTH] User registered successfully: {user_data.email}")
    
    return {"message": "User registered successfully"}

# Login user
@router.post("/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.info(f"[AUTH] Login attempt for email: {login_data.email}")

    user = crud.get_user_by_email(db, email=login_data.email)
    
    if not user or not verify_password(login_data.password, user.password_salt, user.password_hash):
        logger.warning(f"[AUTH] Login failed - invalid credentials: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    logger.info(f"[AUTH] Credentials verified for {login_data.email}")
    header = {"alg": "ES256", "typ": "JWT"}
    now = datetime.utcnow()
    claims = {
        "iss": "kripto-chat-server",
        "sub": str(user.id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=24)).timestamp())
    }
    
    try:
        token = sign(header, claims, {"email": user.email}, JWT_PRIVATE_KEY)
        logger.info(f"[AUTH] Token generated for {user.email}")
    except Exception as e:
        logger.error(f"[AUTH] Token generation failed for {user.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Token generation failed")

    logger.info(f"[AUTH] Login successful for {user.email}")
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "encryptedPrivateKey": user.encrypted_private_key,
            "privateKeyIv": user.private_key_iv,
            "privateKeyKdfSalt": user.private_key_kdf_salt,
        }
    }