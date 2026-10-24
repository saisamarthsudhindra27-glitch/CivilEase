
import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="CivilEase API")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {"message": "CivilEase backend is running!"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    if client is None:
        return {"reply": "Gemini API key is missing. Check your backend .env file."}

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=(
                "You are CivilEase, a legal information and preparation "
                "assistant for users in India. First understand the user's "
                "problem. Ask one useful clarifying question at a time. "
                "Use plain language, be neutral, and do not invent laws or "
                "guarantee outcomes. Explain that you provide general "
                "information, not a lawyer's advice. Do not claim to file "
                "complaints or contact authorities. If the situation is "
                "urgent or involves immediate danger, suggest contacting "
                "appropriate emergency services or a qualified professional.\n\n"
                f"User's message: {request.message}"
            ),
        )
        return {"reply": response.text or "I couldn't generate a reply. Please try again."}

    except Exception as e:
        print("GEMINI ERROR:", repr(e))
        return {"reply": f"Gemini error: {str(e)}"}
