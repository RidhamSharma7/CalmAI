from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import SessionLocal, engine
from schemas import (
    ChatRequest,
    ChatResponse,
    MoodRequest,
    MoodResponse,
    ChatHistory,
)
from ai_service import generate_ai_response
from models import ChatMessage, MoodEntry

import ai_service
print("RUNNING main.py FROM:", __file__)
print("IMPORTING ai_service FROM:", ai_service.__file__)

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CalmAI Backend", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # allow Vercel + any origin
    allow_credentials=False, # must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "CalmAI Backend is Running"}

@app.post("/mood", response_model=MoodResponse)
def save_mood(request: MoodRequest, db: Session = Depends(get_db)):
    entry = MoodEntry(user_id=request.user_id, mood_score=request.mood_score)
    db.add(entry)
    db.commit()
    return {"message": "Mood saved successfully"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # Save user msg
    db.add(ChatMessage(user_id=request.user_id, role="user", content=request.message))
    db.commit()

    # Crisis override
    crisis_keywords = ["suicide", "kill myself", "end my life", "self harm", "want to die"]
    if any(k in request.message.lower() for k in crisis_keywords):
        reply = (
            "I'm really sorry you're feeling this way. You deserve real support.\n"
            "India helplines: Kiran 1800-599-0019. If you're in immediate danger, call local emergency services."
        )
    else:
        reply = generate_ai_response(request.message)

    # Save assistant msg
    db.add(ChatMessage(user_id=request.user_id, role="assistant", content=reply))
    db.commit()

    return {"response": reply}

@app.get("/history/{user_id}", response_model=list[ChatHistory])
def get_history(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.timestamp)
        .all()
    )

@app.get("/moods/{user_id}")
def get_moods(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(MoodEntry)
        .filter(MoodEntry.user_id == user_id)
        .order_by(MoodEntry.timestamp)
        .all()
    )