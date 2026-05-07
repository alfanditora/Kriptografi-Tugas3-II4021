import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from security.password import verify_password, hash_password, generate_salt
from security.jwt_core import sign

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

JWT_PRIVATE_KEY = os.getenv("JWT_PRIVATE_KEY", "")

# Register new user
@router.post("/register", response_model=dict)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):

    db_user = crud.get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    salt = generate_salt()
    hashed_password = hash_password(user_data.password, salt)
    
    crud.create_user(
        db=db, 
        user_schema=user_data, 
        hashed_password=hashed_password, 
        salt=salt
    )
    
    return {"message": "User registered successfully"}

# Login user
@router.post("/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):

    user = crud.get_user_by_email(db, email=login_data.email)
    
    if not user or not verify_password(login_data.password, user.password_salt, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token generation failed")

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }