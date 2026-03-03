from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base
from datetime import datetime
from sqlalchemy import Text, DateTime
from sqlalchemy.sql import func



class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    mood_score = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)



class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    role = Column(String)
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())