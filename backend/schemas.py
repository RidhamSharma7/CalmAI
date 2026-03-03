from pydantic import BaseModel
from typing import Optional

from datetime import datetime


class ChatRequest(BaseModel):
    user_id: str
    message: str


class ChatResponse(BaseModel):
    response: str


class MoodRequest(BaseModel):
    user_id: str
    mood_score: int


class MoodResponse(BaseModel):
    message: str



class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str

class ChatHistory(BaseModel):
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True