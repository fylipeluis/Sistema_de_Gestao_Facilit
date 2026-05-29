import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import clientes, faturas

load_dotenv()

app = FastAPI(title="Facilit API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router)
app.include_router(faturas.router)

@app.get("/health")
def health():
    return {"status": "ok"}



@app.get("/debug-db")
def debug_db():
    return {
        "host": os.getenv("MYSQLHOST"),
        "database": os.getenv("MYSQLDATABASE"),
        "user": os.getenv("MYSQLUSER"),
        "port": os.getenv("MYSQLPORT")
    }