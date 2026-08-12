from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TranscriptSegmentBase(BaseModel):
    start_time: int
    end_time: int
    speaker: str
    text: str

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegment(TranscriptSegmentBase):
    id: int
    meeting_id: int
    class Config:
        orm_mode = True

class SummaryBase(BaseModel):
    text: str

class SummaryCreate(SummaryBase):
    pass

class Summary(SummaryBase):
    id: int
    meeting_id: int
    class Config:
        orm_mode = True

class ActionItemBase(BaseModel):
    assignee: str
    task: str
    is_completed: int = 0

class ActionItemCreate(ActionItemBase):
    pass

class ActionItem(ActionItemBase):
    id: int
    meeting_id: int
    class Config:
        orm_mode = True

class TopicBase(BaseModel):
    name: str
    start_time: int

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    meeting_id: int
    class Config:
        orm_mode = True

class MeetingBase(BaseModel):
    title: str
    duration: int
    participants: str

class MeetingCreate(MeetingBase):
    segments: Optional[List[TranscriptSegmentCreate]] = []
    summaries: Optional[List[SummaryCreate]] = []
    action_items: Optional[List[ActionItemCreate]] = []
    topics: Optional[List[TopicCreate]] = []

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    participants: Optional[str] = None

class Meeting(MeetingBase):
    id: int
    date: datetime
    segments: List[TranscriptSegment] = []
    summaries: List[Summary] = []
    action_items: List[ActionItem] = []
    topics: List[Topic] = []
    class Config:
        orm_mode = True
