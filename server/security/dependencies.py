import os
import uuid
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from security.jwt_core import verify

logger = logging.getLogger(__name__)
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    logger.info("[AUTH] get_current_user called")
    
    if not credentials:
        logger.error("[AUTH] No credentials provided")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No credentials")
    
    token = credentials.credentials
    logger.info(f"[AUTH] Token received, length: {len(token) if token else 0}")
    
    public_key = os.getenv("JWT_PUBLIC_KEY", "")
    logger.debug(f"[AUTH] Public key available: {bool(public_key)}")
    
    try:
        decoded = verify(token, public_key)
        logger.info("[AUTH] Token verified successfully")
        
        user_id = decoded.get("payload", {}).get("sub")
        logger.info(f"[AUTH] User ID from token: {user_id}")
        
        try:
            user_uuid = uuid.UUID(user_id)
            logger.info(f"[AUTH] Converted to UUID: {user_uuid}")
        except (ValueError, TypeError) as e:
            logger.error(f"[AUTH] Invalid UUID format: {user_id}, error: {e}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")
            
        user = db.query(User).filter(User.id == user_uuid).first()
        if not user:
            logger.warning(f"[AUTH] User not found in database: {user_uuid}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        logger.info(f"[AUTH] User authenticated successfully: {user.email}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH] Authentication error: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
