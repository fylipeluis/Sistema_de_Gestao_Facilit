import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import clientes, faturas

load_dotenv()

app = FastAPI(title="Facilit API", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS
# Importante: garantir que OPTIONS (preflight) também receba headers CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://facilitsolucoesfinanceiras1-production.up.railway.app",
        "https://facilitsolucoesfinaceiras.netlify.app",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes.router, prefix="/api")
app.include_router(faturas.router, prefix="/api")



@app.get("/health")
def health():
    return {
        "status": "ok",
        "versao": "TESTE_CORS_2026"
    }