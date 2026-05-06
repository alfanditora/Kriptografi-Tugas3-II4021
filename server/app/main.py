from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models

from app.routers import auth, contacts, conversations, messages

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Secure Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(conversations.router)
app.include_router(messages.router)

@app.get("/")
def root():
    return {"status": "Secure Chat API is running"}