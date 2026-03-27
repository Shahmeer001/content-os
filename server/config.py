from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SERPER_API_KEY    = os.getenv("SERPER_API_KEY")
SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_KEY      = os.getenv("SUPABASE_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY missing from .env")
if not SERPER_API_KEY:
    raise ValueError("SERPER_API_KEY missing from .env")