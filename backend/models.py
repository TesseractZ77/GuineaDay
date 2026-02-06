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
