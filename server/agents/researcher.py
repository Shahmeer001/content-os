from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import Tool
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY, SERPER_API_KEY
from state import ContentState

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.3,
    groq_api_key=GROQ_API_KEY
)

search = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)

researcher_prompt = """You are an expert content researcher. Your job is to research a topic deeply and return structured findings.

Given the keyword: {keyword}
Brand voice context: {brand_voice}

Here is the raw real-time Google search data for this topic:
{search_results}

Using the search data above, please extract and summarize:
1. Top 5 content angles that haven't been overdone
2. Key statistics and data points (with sources if available)
3. Competitor content gaps — what are top articles missing?
4. Interesting subtopics to cover
5. Common questions people ask about this topic

Return a detailed research report with all findings clearly organised."""

from langchain_core.runnables import RunnableConfig

async def researcher_node(state: ContentState, config: RunnableConfig) -> ContentState:
    # 1. Fetch real-time web data natively (prevents small model hallucination loops)
    try:
        raw_search_results = search.run(state["keyword"])
    except Exception as e:
        raw_search_results = "Search engine error: " + str(e)

    # 2. Synthesize the findings
    prompt = researcher_prompt.format(
        keyword=state["keyword"], 
        brand_voice=state.get("brand_voice", "professional"),
        search_results=raw_search_results
    )
    result = await llm.ainvoke(prompt, config)
    return {**state, "research": result.content}