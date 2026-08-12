# Meeting Notes & Transcription Platform (Fireflies Clone)

## Project Overview

This project is a rapid MVP implementation of a Meeting Intelligence platform inspired by Fireflies.ai. It allows users to browse meetings, view mock interactive transcripts synchronized with simulated media playback, and manage AI-generated meeting metadata like summaries, action items, and topics.

## Features

- **Dashboard:** View all meetings, filter by title/participants via an instant search input.
- **Meeting Detail:** Open a specific meeting to view its details.
- **Interactive Transcript:** Read the transcript with speaker tags and timestamps. Clicking a segment seeks the player to that timestamp.
- **Simulated Playback:** Play/Pause controls simulate media playback, synchronizing the transcript highlight to the current timestamp.
- **Transcript Search:** Filter and highlight specific words within a meeting's transcript.
- **AI Insights:** View meeting summaries, topics/chapters, and track action items.
- **Action Items Tracking:** Toggle completion status on action items, aggregating them in a dedicated Action Items view.
- **Full CRUD:** Create new meetings via modal, edit meeting metadata, and delete meetings. Data is persisted to a SQLite database.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + React
- **Backend:** FastAPI + Python
- **Database:** SQLite (via SQLAlchemy)

## Architecture

1. **Next.js Frontend:** Provides a responsive, React-based user interface. It communicates via REST API calls to the backend.
2. **FastAPI Backend:** Handles routing, validation (Pydantic), and database sessions.
3. **SQLAlchemy ORM:** Maps Python objects to SQLite tables.
4. **SQLite Database:** A lightweight local database file (`sql_app.db`) for persistent storage.

## Database Schema

The database consists of the following core entities with one-to-many relationships:

- **Meeting:** The parent entity containing metadata (title, date, duration, participants).
- **TranscriptSegment:** Belongs to a Meeting. Stores start/end times, speaker name, and the text.
- **Summary:** Belongs to a Meeting. Stores paragraph summaries.
- **ActionItem:** Belongs to a Meeting. Stores assignee, task description, and a boolean `is_completed` flag.
- **Topic:** Belongs to a Meeting. Stores chapter markers (name and start time).

## API Overview

- `GET /meetings` - Retrieve all meetings with full nested relationships.
- `GET /meetings/{id}` - Retrieve a single meeting by ID.
- `POST /meetings` - Create a new meeting (with optional segments/action items).
- `PATCH /meetings/{id}` - Update a meeting's metadata.
- `DELETE /meetings/{id}` - Delete a meeting and all cascading nested records.
- `PATCH /action_items/{id}` - Update the completion status of an action item.

## Local Setup

### 1. Backend

Open a terminal and navigate to the `backend` directory.

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

Open a new terminal and navigate to the `frontend` directory.

```bash
cd frontend
npm install

# On Windows (if folder path contains special characters like &):
node node_modules/next/dist/bin/next dev

# On Mac/Linux or simple folder paths:
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

By default, the application runs locally without needing any environment variables (using localhost defaults).

To connect the frontend to the deployed Render backend, configure the environment variable:

```env
NEXT_PUBLIC_API_URL=https://meeting-notes-transcription-api.onrender.com
```


## Seed Data

When the backend starts up, `main.py` automatically initializes the database tables. You can populate the database with realistic mock data by running:

```bash
cd backend
.\venv\Scripts\python seed.py
```

This will insert several meetings with detailed transcripts, action items, and summaries into `sql_app.db`.

## Assumptions / Limitations

As this is a rapid MVP built within a strictly limited timeframe, the following scope constraints apply:

- **Authentication is intentionally mocked:** No real user login system is implemented. The app assumes a default user view.
- **No Real Audio Processing:** Real speech-to-text transcription is outside the scope. The media player is visually simulated via intervals rather than processing a real `.mp3` or `.wav` file.
- **Mock Data Generation:** AI-generated transcripts, summaries, and action items are seeded mock data rather than dynamically generated via OpenAI/external APIs.
- **Deployment:** The application is designed to be run locally. Because it uses SQLite, deploying to an ephemeral serverless environment (like Vercel/Heroku standard) would result in data loss on restart unless a persistent volume is attached.
