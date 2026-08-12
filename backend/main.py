from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import crud, models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Notes API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/meetings", response_model=List[schemas.Meeting])
def read_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_meetings(db, skip=skip, limit=limit)

@app.post("/meetings", response_model=schemas.Meeting)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db=db, meeting=meeting)

@app.get("/meetings/{meeting_id}", response_model=schemas.Meeting)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@app.delete("/meetings/{meeting_id}", response_model=schemas.Meeting)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = crud.delete_meeting(db, meeting_id=meeting_id)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@app.patch("/meetings/{meeting_id}", response_model=schemas.Meeting)
def update_meeting(meeting_id: int, meeting_update: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    db_meeting = crud.update_meeting(db, meeting_id=meeting_id, meeting_update=meeting_update)
    if db_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@app.patch("/action-items/{item_id}")
def update_action_item(item_id: int, is_completed: int, db: Session = Depends(get_db)):
    item = crud.update_action_item(db, item_id, is_completed)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    return item
