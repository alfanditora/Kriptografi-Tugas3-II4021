import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, messages
from app import models

from dotenv import load_dotenv

load_dotenv()

for key in ["JWT_PRIVATE_KEY", "JWT_PUBLIC_KEY"]:
    val = os.getenv(key)
    if val:
        os.environ[key] = val.replace("\\n", "\n")

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
app.include_router(messages.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Welcome to the Secure Chat API",
        "assignment": "Tugas 3 II4021 Kriptografi"
    }

if __name__ == "__main__":
    import uvicorn
    # Run server at port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)