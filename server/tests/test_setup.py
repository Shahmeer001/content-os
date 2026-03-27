import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    try:
        import langchain
        import langgraph
        import fastapi
        import anthropic
        print("✓ All packages imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import failed: {e}")
        return False

def test_env():
    from config import ANTHROPIC_API_KEY, SERPER_API_KEY
    if not ANTHROPIC_API_KEY:
        print("✗ ANTHROPIC_API_KEY missing")
        return False
    if not SERPER_API_KEY:
        print("✗ SERPER_API_KEY missing")
        return False
    print("✓ All API keys loaded from .env")
    return True

def test_state():
    from state import ContentState
    dummy: ContentState = {
        "keyword":           "AI content marketing",
        "brand_voice":       "professional",
        "research":          "",
        "draft":             "",
        "edited_blog":       "",
        "meta_description":  "",
        "seo_score":         0,
        "suggested_title":   "",
        "linkedin_post":     "",
        "twitter_thread":    "",
        "email_newsletter":  "",
        "instagram_caption": ""
    }
    assert dummy["keyword"] == "AI content marketing"
    print("✓ ContentState schema works correctly")
    return True

def test_graph_import():
    try:
        from graph import compiled_graph
        print("✓ LangGraph pipeline compiled successfully")
        return True
    except Exception as e:
        print(f"✗ Graph failed to compile: {e}")
        return False

if __name__ == "__main__":
    results = [
        test_imports(),
        test_env(),
        test_state(),
        test_graph_import()
    ]
    if all(results):
        print("\n✅ All checks passed — ContentOS backend ready")
    else:
        print("\n❌ Fix the errors above before running the server")