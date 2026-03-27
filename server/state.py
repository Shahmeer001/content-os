from typing import TypedDict

class ContentState(TypedDict):
    # Input
    keyword:           str
    brand_voice:       str

    # Researcher output
    research:          str

    # Writer output
    draft:             str

    # Editor outputs
    edited_blog:       str
    meta_description:  str
    seo_score:         int
    suggested_title:   str

    # Repurposer outputs
    linkedin_post:     str
    twitter_thread:    str
    email_newsletter:  str
    instagram_caption: str