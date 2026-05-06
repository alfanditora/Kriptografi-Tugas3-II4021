from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from security.dependencies import get_current_user

router = APIRouter(prefix="/api/contacts", tags=["contacts"])

@router.get("/")
def get_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.id != current_user.id).all()
    return {"items": [{"id": u.id, "email": u.email} for u in users]}