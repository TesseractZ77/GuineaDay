from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
import datetime

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    due_date = Column(DateTime, default=datetime.datetime.utcnow)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True) # daily, weekly, etc.
    assignee_id = Column(String, nullable=True) # e.g. "hachi", "kui"
    priority = Column(String, default="medium") # high, medium, low
    category = Column(String, default="general") # feeding, cleaning, etc.
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    caption = Column(String, nullable=True)
    date_taken = Column(DateTime, default=datetime.datetime.utcnow)
    guinea_pig_tags = Column(String, nullable=True) # Check comma-separated IDs e.g. "hachi,seven"
    album_id = Column(Integer, nullable=True) # Foreign key to Album (optional)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
