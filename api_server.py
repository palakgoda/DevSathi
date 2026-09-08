import os
import json
import urllib.request
from datetime import datetime
from typing import List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# -------------------------------------------------------------
# 1. Supabase Database Configuration
# -------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set. Add it to your environment or .env file.")

# Ensure standard postgresql:// prefix (some drivers or envs supply postgres://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class StudioSessionModel(Base):
    __tablename__ = "studio_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False)
    files = Column(JSONB, default=list)
    active_file = Column(String(255), default="")
    code = Column(Text, default="")
    messages = Column(JSONB, default=list)
    workspace_mode = Column(String(50), default="editor")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# 2. FastAPI Application & CORS
# -------------------------------------------------------------
app = FastAPI(title="DevSarthi Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 3. Schemas
# -------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    code: str = ""
    prompt: str = ""
    language: str = "python"

class SaveSessionSchema(BaseModel):
    subject: str
    topic: str
    files: List[Any] = []
    active_file: str = ""
    code: str = ""
    messages: List[Any] = []
    workspace_mode: str = "editor"

# -------------------------------------------------------------
# 4. Studio Persistence Endpoints
# -------------------------------------------------------------
@app.get("/api/studio/session")
def get_studio_session(subject: str, topic: str, db: Session = Depends(get_db)):
    record = (
        db.query(StudioSessionModel)
        .filter(StudioSessionModel.subject == subject, StudioSessionModel.topic == topic)
        .first()
    )
    if not record:
        return {"exists": False}

    return {
        "exists": True,
        "data": {
            "subject": record.subject,
            "topic": record.topic,
            "files": record.files or [],
            "active_file": record.active_file or "",
            "code": record.code or "",
            "messages": record.messages or [],
            "workspace_mode": record.workspace_mode or "editor",
        }
    }

@app.put("/api/studio/session")
def save_studio_session(payload: SaveSessionSchema, db: Session = Depends(get_db)):
    record = (
        db.query(StudioSessionModel)
        .filter(StudioSessionModel.subject == payload.subject, StudioSessionModel.topic == payload.topic)
        .first()
    )

    if not record:
        record = StudioSessionModel(
            subject=payload.subject,
            topic=payload.topic,
            files=payload.files,
            active_file=payload.active_file,
            code=payload.code,
            messages=payload.messages,
            workspace_mode=payload.workspace_mode,
        )
        db.add(record)
    else:
        record.files = payload.files
        record.active_file = payload.active_file
        record.code = payload.code
        record.messages = payload.messages
        record.workspace_mode = payload.workspace_mode

    db.commit()
    return {"status": "saved"}

# -------------------------------------------------------------
# 5. Existing DevSarthi Tutor & Health Endpoints
# -------------------------------------------------------------
@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    user_query = req.prompt.strip() if req.prompt.strip() else "Please analyze my code and give me a clue."
    
    is_hinglish = "hinglish" in user_query.lower() or "hindi" in user_query.lower()
    lang_rule = "Respond in Hinglish." if is_hinglish else "Respond strictly in English."

    system_instruction = (
        f"You are DevSarthi, a Socratic coding tutor. {lang_rule}\n"
        "CRITICAL: Do NOT write full code implementations or code blocks. "
        "Ask ONLY 1 or 2 guiding questions so the student solves the issue themselves."
    )

    user_content = f"Language: {req.language}\nCode Context:\n{req.code}\n\nStudent Question:\n{user_query}"

    data = {
        "model": "devsarthi",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content}
        ],
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }
    
    req_bytes = json.dumps(data).encode('utf-8')
    
    try:
        request = urllib.request.Request(
            "http://localhost:11434/api/chat", 
            data=req_bytes, 
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            ai_response = result.get("message", {}).get("content", "").strip()
            
            return {
                "response": ai_response,
                "message": ai_response,
                "agent": "DevSarthi",
                "status": "success"
            }
    except Exception as e:
        return {"response": f"Error: {str(e)}", "status": "error"}

@app.get("/health")
def health():
    return {"status": "DevSarthi backend is running!"}
