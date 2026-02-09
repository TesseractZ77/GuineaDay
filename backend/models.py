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

class GuineaPig(Base):
    __tablename__ = "guinea_pigs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    birth_date = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    breed = Column(String, nullable=True)
    color = Column(String, nullable=True) # e.g. "bg-orange-100 text-orange-800"
    adoption_date = Column(DateTime, nullable=True)
    personality_notes = Column(String, nullable=True)
    food_preferences = Column(String, nullable=True)
    is_archived = Column(Boolean, default=False)
    photo_url = Column(String, nullable=True)

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    guinea_pig_id = Column(Integer, index=True) # Foreign Key relationship can be enforced or kept loose
    date = Column(DateTime, default=datetime.datetime.utcnow)
    weight_grams = Column(Integer)
    notes = Column(String, nullable=True)
