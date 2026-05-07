import os
import base64
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_salt() -> str:
    return base64.b64encode(os.urandom(16)).decode('utf-8')

def hash_password(plain_password: str, salt: str) -> str:
    salted_password = f"{plain_password}{salt}"
    return pwd_context.hash(salted_password)

def verify_password(plain_password: str, salt: str, hashed_password: str) -> bool:
    salted_password = f"{plain_password}{salt}"
    return pwd_context.verify(salted_password, hashed_password)