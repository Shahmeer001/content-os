from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from graph import compiled_graph
from api.database import (
    save_content, get_history,
    delete_content, save_brand_profile, get_brand_profile
)
from chains.brand_voice import extract_brand_voice
from config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client

app = FastAPI(title="ContentOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Models ────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    keyword:     str
    brand_voice: Optional[str] = "professional"
    user_id:     Optional[str] = None

class AuthRequest(BaseModel):
    email:    str
    password: str

class BrandRequest(BaseModel):
    user_id:     str
    tone:        str
    sample_text: str

# ── Auth ──────────────────────────────────────────────────
@app.post("/auth/signup")
async def signup(req: AuthRequest):
    try:
        result = supabase.auth.sign_up({
            "email":    req.email,
            "password": req.password
        })
        return {"user": result.user, "session": result.session}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(req: AuthRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email":    req.email,
            "password": req.password
        })
        return {"user": result.user, "session": result.session}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ── Generate ──────────────────────────────────────────────
async def stream_pipeline(keyword: str, brand_voice: str, user_id: str):
    final_state = {}
    try:
        async for event in compiled_graph.astream_events(
            {"keyword": keyword, "brand_voice": brand_voice},
            version="v1"
        ):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                if token:
                    yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

            if event["event"] == "on_chain_end" and event["name"] == "LangGraph":
                final_state = event["data"].get("output", {})

        # Save to DB after pipeline completes
        if user_id and final_state:
            save_content(user_id, keyword, final_state)

        yield f"data: {json.dumps({'type': 'done', 'data': final_state})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

@app.post("/generate")
async def generate(req: GenerateRequest):
    return StreamingResponse(
        stream_pipeline(req.keyword, req.brand_voice, req.user_id or ""),
        media_type="text/event-stream"
    )

# ── History ───────────────────────────────────────────────
@app.get("/history/{user_id}")
async def history(user_id: str):
    result = get_history(user_id)
    return {"history": result.data}

@app.delete("/history/{content_id}")
async def delete(content_id: str):
    delete_content(content_id)
    return {"deleted": True}

# ── Brand ─────────────────────────────────────────────────
@app.post("/brand")
async def save_brand(req: BrandRequest):
    extracted = extract_brand_voice(req.sample_text, req.tone)
    save_brand_profile(req.user_id, req.tone, req.sample_text, extracted)
    return {"extracted_voice": extracted}

@app.get("/brand/{user_id}")
async def get_brand(user_id: str):
    profile = get_brand_profile(user_id)
    return {"profile": profile}

# ── Health ────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}