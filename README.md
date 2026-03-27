# ContentOS

ContentOS is a full-stack, AI-powered content generation and management platform. It allows users to create SEO-optimized blog posts, extract their unique brand voice, and instantly repurpose content for multiple social media platforms, all in real-time.

## Features

- **🧠 Multi-Agent AI Architecture**: Built on LangGraph, utilizing specialized agents (Researcher, Writer, Editor, Repurposer) to ensure high-quality content output.
- **⚡ Real-Time Streaming**: Watch your content generate word-by-word with FastAPI's Server-Sent Events (SSE).
- **🚀 Advanced AI Models**: Uses Llama 3 (70B) via Groq for lightning-fast text generation and tool calling.
- **🔍 Automated Web Research**: Integrates Serper API to pull live statistics, competitor gaps, and factual data before writing.
- **📱 One-Click Repurposing**: Automatically adapts your blog posts into LinkedIn updates, Twitter threads, email newsletters, and Instagram captions.
- **🔐 Secure Authentication**: Integrated with Supabase for user registration, authentication, and secure database management.

## Tech Stack

- **Frontend**: React (Vite), React Router, Vanilla CSS
- **Backend**: Python, FastAPI, Uvicorn, LangChain, LangGraph
- **Database/Auth**: Supabase
- **AI/APIs**: Groq (Llama 3), Serper (Google Search)

## Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.11+
- API Keys for Groq, Serper, LangSmith, and Supabase

### 1. Clone the repository
```bash
git clone https://github.com/Shahmeer001/content-os.git
cd content-os
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Create a `.env.local` file in the `client` folder and add your Supabase credentials:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Backend Setup
```bash
cd server
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `server` folder:
```env
GROQ_API_KEY=your-groq-key
SERPER_API_KEY=your-serper-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=contentos
```

Run the backend server:
```bash
uvicorn api.main:app --reload --port 8000
```
