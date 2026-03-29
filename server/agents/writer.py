from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY
from state import ContentState

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.7,
    groq_api_key=GROQ_API_KEY
)

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert SEO content writer.
You write in the following brand voice: {brand_voice}
Always match this tone exactly throughout the article.
Write engaging, informative, and well-structured content."""),
    ("human", """Write a full 1000-word SEO blog post about: {keyword}

Use this research as your factual foundation:
{research}

Structure requirements:
- One compelling H1 title (include the keyword)
- An engaging introduction (hook the reader in the first 2 sentences)
- 4-5 H2 sections with detailed content
- Bullet points or numbered lists where appropriate
- A strong conclusion with a clear call to action
- Naturally include the keyword 4-6 times throughout

Write the full article now:""")
])

writer_chain = writer_prompt | llm.with_config({"tags": ["blog"]}) | StrOutputParser()

from langchain_core.runnables import RunnableConfig

async def writer_node(state: ContentState, config: RunnableConfig) -> ContentState:
    draft = await writer_chain.ainvoke({
        "keyword":    state["keyword"],
        "research":   state["research"],
        "brand_voice": state.get("brand_voice", "professional")
    }, config)
    return {**state, "draft": draft}