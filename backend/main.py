from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import datetime
import os
import shutil

models.Base.metadata.create_all(bind=engine)

from fastapi.staticfiles import StaticFiles
import os
import shutil

# ... existing code ...

app = FastAPI()

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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

# --- Photo Gallery ---

from fastapi import File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
import shutil
import os

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic Models for Gallery
class AlbumBase(BaseModel):
    name: str
    description: Optional[str] = None

class AlbumCreate(AlbumBase):
    pass

class Album(AlbumBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True

class PhotoBase(BaseModel):
    caption: Optional[str] = None
    guinea_pig_tags: Optional[str] = None # comma separated
    album_id: Optional[int] = None

class PhotoCreate(PhotoBase):
    pass

class Photo(PhotoBase):
    id: int
    filename: str
    date_taken: datetime.datetime
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# API Endpoints for Gallery

@app.post("/albums/", response_model=Album)
def create_album(album: AlbumCreate, db: Session = Depends(get_db)):
    db_album = models.Album(**album.dict())
    db.add(db_album)
    db.commit()
    db.refresh(db_album)
    return db_album

@app.get("/albums/", response_model=List[Album])
def read_albums(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    albums = db.query(models.Album).offset(skip).limit(limit).all()
    return albums

@app.post("/photos/upload", response_model=Photo)
async def upload_photo(
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    guinea_pig_tags: Optional[str] = Form(None),
    album_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    # Verify album if provided
    if album_id:
        db_album = db.query(models.Album).filter(models.Album.id == album_id).first()
        if not db_album:
            raise HTTPException(status_code=404, detail="Album not found")

    # Save file
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Create DB entry
    db_photo = models.Photo(
        filename=file.filename,
        caption=caption,
        guinea_pig_tags=guinea_pig_tags,
        album_id=album_id
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.get("/photos/", response_model=List[Photo])
def read_photos(
    skip: int = 0, 
    limit: int = 100, 
    album_id: Optional[int] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Photo)
    
    if album_id:
        query = query.filter(models.Photo.album_id == album_id)
    
    if tag:
        # Simple string contains check for now
        query = query.filter(models.Photo.guinea_pig_tags.contains(tag))
        
    photos = query.offset(skip).limit(limit).all()
    return photos

@app.delete("/photos/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Remove file from disk
    file_path = f"uploads/{photo.filename}"
    if os.path.exists(file_path):
        os.remove(file_path)
    
    db.delete(photo)
    db.commit()
    return {"ok": True}

# --- Profile Management ---

# Pydantic Models for Profile
class GuineaPigBase(BaseModel):
    name: str
    birth_date: Optional[datetime.datetime] = None
    gender: Optional[str] = None
    breed: Optional[str] = None
    color: Optional[str] = None
    adoption_date: Optional[datetime.datetime] = None
    personality_notes: Optional[str] = None
    food_preferences: Optional[str] = None
    is_archived: bool = False
    photo_url: Optional[str] = None

class GuineaPigCreate(GuineaPigBase):
    pass

class GuineaPig(GuineaPigBase):
    id: int

    class Config:
        orm_mode = True

class WeightLogBase(BaseModel):
    weight_grams: int
    notes: Optional[str] = None
    date: Optional[datetime.datetime] = None

class WeightLogCreate(WeightLogBase):
    pass

class WeightLog(WeightLogBase):
    id: int
    guinea_pig_id: int
    date: datetime.datetime

    class Config:
        orm_mode = True

# API Endpoints for Profiles

@app.post("/guineapigs/", response_model=GuineaPig)
def create_guinea_pig(pig: GuineaPigCreate, db: Session = Depends(get_db)):
    try:
        print(f"Creating pig with data: {pig.dict()}")
        db_pig = models.GuineaPig(**pig.dict())
        db.add(db_pig)
        db.commit()
        db.refresh(db_pig)
        return db_pig
    except Exception as e:
        print(f"Error creating pig: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/guineapigs/", response_model=List[GuineaPig])
def read_guinea_pigs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    pigs = db.query(models.GuineaPig).filter(models.GuineaPig.is_archived == False).offset(skip).limit(limit).all()
    return pigs

@app.get("/guineapigs/{pig_id}", response_model=GuineaPig)
def read_guinea_pig(pig_id: int, db: Session = Depends(get_db)):
    pig = db.query(models.GuineaPig).filter(models.GuineaPig.id == pig_id).first()
    if pig is None:
        raise HTTPException(status_code=404, detail="Guinea Pig not found")
    return pig

@app.put("/guineapigs/{pig_id}", response_model=GuineaPig)
def update_guinea_pig(pig_id: int, pig: GuineaPigCreate, db: Session = Depends(get_db)):
    db_pig = db.query(models.GuineaPig).filter(models.GuineaPig.id == pig_id).first()
    if db_pig is None:
        raise HTTPException(status_code=404, detail="Guinea Pig not found")
    
    for key, value in pig.dict().items():
        setattr(db_pig, key, value)
    
    db.commit()
    db.refresh(db_pig)
    return db_pig

@app.delete("/guineapigs/{pig_id}")
def delete_guinea_pig(pig_id: int, db: Session = Depends(get_db)):
    # Soft delete by archiving
    db_pig = db.query(models.GuineaPig).filter(models.GuineaPig.id == pig_id).first()
    if db_pig is None:
        raise HTTPException(status_code=404, detail="Guinea Pig not found")
    
    db_pig.is_archived = True
    db.commit()
    return {"ok": True}

# API Endpoints for Weight Logs

@app.post("/guineapigs/{pig_id}/weights", response_model=WeightLog)
def create_weight_log(pig_id: int, weight: WeightLogCreate, db: Session = Depends(get_db)):
    # Verify pig exists
    pig = db.query(models.GuineaPig).filter(models.GuineaPig.id == pig_id).first()
    if not pig:
        raise HTTPException(status_code=404, detail="Guinea Pig not found")

    weight_data = weight.dict()
    if weight_data.get('date') is None:
        weight_data['date'] = datetime.datetime.utcnow()
        
    db_weight = models.WeightLog(**weight_data, guinea_pig_id=pig_id)
    db.add(db_weight)
    db.commit()
    db.refresh(db_weight)
    return db_weight

@app.get("/guineapigs/{pig_id}/weights", response_model=List[WeightLog])
def read_weight_logs(pig_id: int, db: Session = Depends(get_db)):
    weights = db.query(models.WeightLog).filter(models.WeightLog.guinea_pig_id == pig_id).order_by(models.WeightLog.date.desc()).all()
    return weights

@app.post("/guineapigs/{pig_id}/photo", response_model=GuineaPig)
async def upload_pig_photo(
    pig_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    pig = db.query(models.GuineaPig).filter(models.GuineaPig.id == pig_id).first()
    if not pig:
        raise HTTPException(status_code=404, detail="Guinea Pig not found")
    
    # Save file with a unique name
    filename = f"pig_{pig_id}_{int(datetime.datetime.now().timestamp())}_{file.filename}"
    file_location = f"uploads/{filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Update pig profile with photo URL
    pig.photo_url = f"uploads/{filename}"
    db.commit()
    db.refresh(pig)
    return pig

@app.delete("/weights/{weight_id}")
def delete_weight_log(weight_id: int, db: Session = Depends(get_db)):
    weight = db.query(models.WeightLog).filter(models.WeightLog.id == weight_id).first()
    if not weight:
        raise HTTPException(status_code=404, detail="Weight log not found")
    
    db.delete(weight)
    db.commit()
    return {"ok": True}
