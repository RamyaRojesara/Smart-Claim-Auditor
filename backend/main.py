from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from app.db.database import engine, Base
from app.api import routes

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Claim Auditor API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
