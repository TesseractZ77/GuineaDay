from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "*"], # Adjust ports as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class TaskBase(BaseModel):
    title: str
    due_date: Optional[datetime.datetime] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    assignee_id: Optional[str] = None
    priority: str = "medium"
    category: str = "general"
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime.datetime] = None

    class Config:
        orm_mode = True

@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).offset(skip).limit(limit).all()
    return tasks

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task.dict().items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}/complete", response_model=Task)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.is_completed = True
    db_task.completed_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"ok": True}
