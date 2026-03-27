from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY
from state import ContentState

llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0.3,
    groq_api_key=GROQ_API_KEY
)

class EditedArticle(BaseModel):
    edited_blog:      str   = Field(description="The fully edited and polished blog post")
    meta_description: str   = Field(description="SEO meta description under 160 characters")
    seo_score:        int   = Field(description="SEO quality score from 0 to 100")
    suggested_title:  str   = Field(description="An optimised SEO title including the keyword")

editor_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a senior SEO editor and content strategist.
Your job is to polish articles for maximum SEO impact and readability."""),
    ("human", """Edit and improve this blog post about: {keyword}

Original draft:
{draft}

Your editing checklist:
- Fix any grammar or clarity issues
- Ensure keyword "{keyword}" appears naturally 4-6 times
- Improve the introduction hook if weak
- Strengthen the conclusion and CTA
- Ensure all H2 headings are compelling
- Add transition sentences between sections if missing
- Score the SEO quality from 0-100 based on structure, keyword use, and readability
- Write a meta description under 160 characters
- Suggest an optimised title

Return the fully edited article with all required fields.""")
])

structured_llm = llm.with_structured_output(EditedArticle)
editor_chain   = editor_prompt | structured_llm

async def editor_node(state: ContentState) -> ContentState:
    result = await editor_chain.ainvoke({
        "keyword": state["keyword"],
        "draft":   state["draft"]
    })
    return {
        **state,
        "edited_blog":      result.edited_blog,
        "meta_description": result.meta_description,
        "seo_score":        result.seo_score,
        "suggested_title":  result.suggested_title
    }