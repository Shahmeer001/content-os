from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import GROQ_API_KEY

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.3,
    groq_api_key=GROQ_API_KEY
)

voice_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a brand voice analyst. Analyse writing samples and extract voice patterns."),
    ("human", """Analyse this writing sample and extract the brand voice profile.

Sample text:
{sample_text}

Tone setting: {tone}

Extract and describe:
1. Vocabulary level (simple / technical / mixed)
2. Average sentence length (short / medium / long)
3. Tone characteristics (3-5 adjectives)
4. 3 signature phrases or structural patterns you notice
5. What to avoid to stay in this voice

Return a concise brand voice guide that a writer can follow.""")
])

voice_extractor_chain = voice_prompt | llm | StrOutputParser()

def extract_brand_voice(sample_text: str, tone: str = "professional") -> str:
    return voice_extractor_chain.invoke({
        "sample_text": sample_text,
        "tone":        tone
    })