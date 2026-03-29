from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import sys, os, asyncio
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY
from state import ContentState

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.7,
    groq_api_key=GROQ_API_KEY
)

# LinkedIn
linkedin_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a LinkedIn content expert. Brand voice: {brand_voice}"),
    ("human", """Turn this blog post into a LinkedIn post.
Blog: {blog}
Rules: max 1300 characters, start with a hook line, use line breaks for readability,
end with a question to drive comments, add 3-5 relevant hashtags.""")
])

# Twitter thread
twitter_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a Twitter/X content expert. Brand voice: {brand_voice}"),
    ("human", """Turn this blog post into a Twitter thread.
Blog: {blog}
Rules: exactly 10 tweets, number each tweet (1/10, 2/10 etc),
tweet 1 is the hook, tweet 10 is the CTA, each tweet max 280 characters.""")
])

# Email newsletter
email_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an email marketing expert. Brand voice: {brand_voice}"),
    ("human", """Turn this blog post into an email newsletter.
Blog: {blog}
Rules: subject line, preview text, greeting, 3-4 short paragraphs,
one clear CTA button text, sign-off. Keep it scannable.""")
])

# Instagram caption
instagram_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an Instagram content expert. Brand voice: {brand_voice}"),
    ("human", """Turn this blog post into an Instagram caption.
Blog: {blog}
Rules: start with an attention-grabbing first line, 3-4 short punchy paragraphs,
CTA in last line, 10-15 relevant hashtags at the end.""")
])

parser = StrOutputParser()

linkedin_chain  = linkedin_prompt  | llm.with_config({"tags": ["linkedin"]})  | parser
twitter_chain   = twitter_prompt   | llm.with_config({"tags": ["twitter"]})   | parser
email_chain     = email_prompt     | llm.with_config({"tags": ["email"]})     | parser
instagram_chain = instagram_prompt | llm.with_config({"tags": ["instagram"]}) | parser

from langchain_core.runnables import RunnableConfig

async def repurposer_node(state: ContentState, config: RunnableConfig) -> ContentState:
    # Generate sequentially to reduce Groq load
    linked_in = await linkedin_chain.ainvoke({
        "blog": state["edited_blog"],
        "brand_voice": state.get("brand_voice", "professional")
    }, config)
    
    await asyncio.sleep(1) # Small delay for Groq rate limits
    twitter = await twitter_chain.ainvoke({
        "blog": state["edited_blog"],
        "brand_voice": state.get("brand_voice", "professional")
    }, config)
    
    await asyncio.sleep(1)
    email = await email_chain.ainvoke({
        "blog": state["edited_blog"],
        "brand_voice": state.get("brand_voice", "professional")
    }, config)
    
    await asyncio.sleep(1)
    instagram = await instagram_chain.ainvoke({
        "blog": state["edited_blog"],
        "brand_voice": state.get("brand_voice", "professional")
    }, config)

    return {
        **state,
        "linkedin_post":    linked_in,
        "twitter_thread":   twitter,
        "email_newsletter": email,
        "instagram_caption":instagram
    }