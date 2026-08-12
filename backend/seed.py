import sys
import os

# Add the parent directory to sys.path so we can import backend as a package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import Base
from backend import crud, schemas

Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    if crud.get_meetings(db, limit=1):
        print("Database already seeded.")
        return

    meeting1 = schemas.MeetingCreate(
        title="Q3 Product Roadmap Review",
        duration=1200,
        participants="Sarah, Alex, John",
        segments=[
            schemas.TranscriptSegmentCreate(start_time=0, end_time=10, speaker="Sarah", text="Let's begin with the Q3 product review."),
            schemas.TranscriptSegmentCreate(start_time=10, end_time=25, speaker="Alex", text="I've prepared the latest metrics. We saw a 15% growth in user retention this quarter."),
            schemas.TranscriptSegmentCreate(start_time=25, end_time=40, speaker="Sarah", text="That's great. What about the new feature rollout?"),
            schemas.TranscriptSegmentCreate(start_time=40, end_time=60, speaker="John", text="We had a slight delay with the database migration, but it should be ready by next week."),
            schemas.TranscriptSegmentCreate(start_time=60, end_time=90, speaker="Alex", text="I'll make sure the analytics tracking is implemented for it before launch."),
            schemas.TranscriptSegmentCreate(start_time=90, end_time=120, speaker="Sarah", text="Perfect. Let's make sure we communicate the changes to the marketing team."),
        ],
        summaries=[
            schemas.SummaryCreate(text="The team discussed Q3 product retention which grew by 15%. A minor delay in database migration pushed the new feature rollout to next week. Analytics tracking needs to be finalized before launch.")
        ],
        action_items=[
            schemas.ActionItemCreate(assignee="John", task="Complete database migration", is_completed=0),
            schemas.ActionItemCreate(assignee="Alex", task="Implement analytics tracking for new feature", is_completed=0),
            schemas.ActionItemCreate(assignee="Sarah", task="Communicate with marketing team", is_completed=1),
        ],
        topics=[
            schemas.TopicCreate(name="Q3 Metrics", start_time=10),
            schemas.TopicCreate(name="Feature Rollout Delay", start_time=40),
            schemas.TopicCreate(name="Next Steps", start_time=90),
        ]
    )

    meeting2 = schemas.MeetingCreate(
        title="Engineering Sync: Microservices Architecture",
        duration=900,
        participants="David, Elena",
        segments=[
            schemas.TranscriptSegmentCreate(start_time=0, end_time=15, speaker="David", text="Hi Elena, thanks for joining. I wanted to discuss splitting the monolith."),
            schemas.TranscriptSegmentCreate(start_time=15, end_time=30, speaker="Elena", text="Hey David. Yes, I've looked at the current load. We definitely need to extract the payment service first."),
            schemas.TranscriptSegmentCreate(start_time=30, end_time=50, speaker="David", text="Agreed. I'll start drafting the API spec for the payment service today."),
            schemas.TranscriptSegmentCreate(start_time=50, end_time=75, speaker="Elena", text="Sounds good. Let's review the spec on Thursday before we start implementation."),
        ],
        summaries=[
            schemas.SummaryCreate(text="Discussion on splitting the monolith. Decision made to extract the payment service first. David to draft API specs for review by Thursday.")
        ],
        action_items=[
            schemas.ActionItemCreate(assignee="David", task="Draft API spec for payment service", is_completed=0),
            schemas.ActionItemCreate(assignee="Elena", task="Review API spec on Thursday", is_completed=0),
        ],
        topics=[
            schemas.TopicCreate(name="Microservices Transition", start_time=0),
            schemas.TopicCreate(name="Payment Service", start_time=15),
        ]
    )

    crud.create_meeting(db, meeting1)
    crud.create_meeting(db, meeting2)

    print("Seed complete.")
    db.close()

if __name__ == "__main__":
    seed_data()
