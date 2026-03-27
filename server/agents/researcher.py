from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import Tool
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY, SERPER_API_KEY
from state import ContentState

llm = ChatGroq(
    model="llama3-70b-8192",
    temperature=0.3,
    groq_api_key=GROQ_API_KEY
)

search = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)
search_tool = Tool(
    name="web_search",
    func=search.run,
    description="Search the web for current information, articles, and data about any topic."
)
tools = [search_tool]

researcher_prompt = """You are an expert content researcher. Your job is to research a topic deeply and return structured findings.

Given the keyword: {keyword}
Brand voice context: {brand_voice}

Use web search to find:
1. Top 5 content angles that haven't been overdone
2. Key statistics and data points (with sources)
3. Competitor content gaps — what are top articles missing?
4. Interesting subtopics to cover
5. Common questions people ask about this topic

Return a detailed research report with all findings clearly organised."""

researcher_executor = create_react_agent(llm, tools)

async def researcher_node(state: ContentState) -> ContentState:
    prompt = researcher_prompt.format(
        keyword=state["keyword"], 
        brand_voice=state.get("brand_voice", "professional")
    )
    result = await researcher_executor.ainvoke({"messages": [("user", prompt)]})
    return {**state, "research": result["messages"][-1].content}