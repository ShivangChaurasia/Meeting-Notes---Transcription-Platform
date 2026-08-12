from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    duration = Column(Integer) # in seconds
    participants = Column(String) # comma separated

    segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="meeting", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="meeting", cascade="all, delete-orphan")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    start_time = Column(Integer) # seconds
    end_time = Column(Integer) # seconds
    speaker = Column(String)
    text = Column(Text)

    meeting = relationship("Meeting", back_populates="segments")

class Summary(Base):
    __tablename__ = "summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    text = Column(Text)

    meeting = relationship("Meeting", back_populates="summaries")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    assignee = Column(String)
    task = Column(String)
    is_completed = Column(Integer, default=0) # boolean via integer 0/1

    meeting = relationship("Meeting", back_populates="action_items")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    name = Column(String)
    start_time = Column(Integer)

    meeting = relationship("Meeting", back_populates="topics")
