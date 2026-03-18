from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict
import time
import httpx
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

app = FastAPI(title="Trade Opportunities API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT = 5
RATE_WINDOW = 60
SECRET_TOKEN = "mysecrettoken"

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")

sessions: Dict[str, Dict] = {}

security = HTTPBearer()

def authenticate(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")
    return credentials.credentials


def check_rate_limit(token: str):
    now = time.time()
    session = sessions.setdefault(token, {"count": 0, "start": now})

    if now - session["start"] > RATE_WINDOW:
        session["count"] = 0
        session["start"] = now

    if session["count"] >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    session["count"] += 1


async def fetch_news(sector: str):
    url = f"https://duckduckgo.com/?q={sector}+india+market+news&format=json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            return response.text[:1000]
        except Exception:
            return "No data found"


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def analyze_with_ai(data: str, sector: str):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Analyze the Indian {sector} sector based on this data:

    {data}

    Provide a structured markdown report with:
    ## Market Summary
    ## Key Trends
    ## Trade Opportunities
    ## Risks
    ## Conclusion
    """

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(url, headers=headers, json=payload)

            if res.status_code != 200:
                return f"Error from AI: {res.text}"

            result = res.json()
            return result["choices"][0]["message"]["content"]

        except Exception as e:
            return f"Analysis failed: {str(e)}"

def format_markdown(sector: str, analysis: str):
    return f"""
# Trade Opportunities Report: {sector.title()}

{analysis}

---
Generated at: {time.ctime()}
"""


@app.get("/analyze/{sector}")
async def analyze_sector(sector: str, token: str = Depends(authenticate)):
    if not sector.isalpha():
        raise HTTPException(status_code=400, detail="Invalid sector name")

    check_rate_limit(token)

    news_data = await fetch_news(sector)
    analysis = await analyze_with_ai(news_data, sector)
    report = format_markdown(sector, analysis)

    return {"report": report}


@app.get("/")
def root():
    return {"message": "Trade Opportunities API Running"}