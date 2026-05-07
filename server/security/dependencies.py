import os
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from security.jwt_core import verify

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    public_key = os.getenv("JWT_PUBLIC_KEY", "")
    
    try:
        decoded = verify(token, public_key)
        user_id = decoded.get("payload", {}).get("sub")
        try:
            user_uuid = uuid.UUID(user_id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
            
        user = db.query(User).filter(User.id == user_uuid).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
            
        return user
    except Exception as e:
        print("VERIFY EXCEPTION:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
