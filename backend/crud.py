from sqlalchemy.orm import Session
import models, schemas

def get_meeting(db: Session, meeting_id: int):
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()

def get_meetings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Meeting).order_by(models.Meeting.date.desc()).offset(skip).limit(limit).all()

def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    db_meeting = models.Meeting(
        title=meeting.title,
        duration=meeting.duration,
        participants=meeting.participants
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    for seg in meeting.segments:
        db_seg = models.TranscriptSegment(**seg.dict(), meeting_id=db_meeting.id)
        db.add(db_seg)
    for summary in meeting.summaries:
        db_sum = models.Summary(**summary.dict(), meeting_id=db_meeting.id)
        db.add(db_sum)
    for ai in meeting.action_items:
        db_ai = models.ActionItem(**ai.dict(), meeting_id=db_meeting.id)
        db.add(db_ai)
    for topic in meeting.topics:
        db_topic = models.Topic(**topic.dict(), meeting_id=db_meeting.id)
        db.add(db_topic)

    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def delete_meeting(db: Session, meeting_id: int):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if meeting:
        db.delete(meeting)
        db.commit()
    return meeting

def update_meeting(db: Session, meeting_id: int, meeting_update: schemas.MeetingUpdate):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if db_meeting:
        if meeting_update.title is not None:
            db_meeting.title = meeting_update.title
        if meeting_update.participants is not None:
            db_meeting.participants = meeting_update.participants
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def update_action_item(db: Session, action_item_id: int, is_completed: int):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == action_item_id).first()
    if item:
        item.is_completed = is_completed
        db.commit()
        db.refresh(item)
    return item
