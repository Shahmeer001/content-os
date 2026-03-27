from supabase import create_client, Client
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def save_content(user_id: str, keyword: str, result: dict):
    supabase.table("content_history").insert({
        "user_id":   user_id,
        "keyword":   keyword,
        "blog":      result.get("edited_blog", ""),
        "linkedin":  result.get("linkedin_post", ""),
        "twitter":   result.get("twitter_thread", ""),
        "email":     result.get("email_newsletter", ""),
        "instagram": result.get("instagram_caption", ""),
        "seo_score": result.get("seo_score", 0),
    }).execute()

def get_history(user_id: str):
    return supabase.table("content_history")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()

def delete_content(content_id: str):
    return supabase.table("content_history")\
        .delete()\
        .eq("id", content_id)\
        .execute()

def save_brand_profile(user_id: str, tone: str, sample_text: str, extracted_voice: str):
    existing = supabase.table("brand_profiles")\
        .select("id")\
        .eq("user_id", user_id)\
        .execute()
    if existing.data:
        supabase.table("brand_profiles")\
            .update({
                "tone":           tone,
                "sample_text":    sample_text,
                "extracted_voice": extracted_voice
            })\
            .eq("user_id", user_id)\
            .execute()
    else:
        supabase.table("brand_profiles").insert({
            "user_id":         user_id,
            "tone":            tone,
            "sample_text":     sample_text,
            "extracted_voice": extracted_voice
        }).execute()

def get_brand_profile(user_id: str):
    result = supabase.table("brand_profiles")\
        .select("*")\
        .eq("user_id", user_id)\
        .execute()
    return result.data[0] if result.data else None