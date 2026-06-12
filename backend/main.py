import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from backend.routers import clientes, faturas

load_dotenv()
logging.basicConfig(level=logging.INFO)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Importa aqui para evitar circular import
    from backend.scheduler import rotina_diaria

    # Roda todo dia às 08h (horário do servidor — Railway usa UTC, ajuste se precisar)
    #scheduler.add_job(rotina_diaria, "cron", hour=8, minute=0, id="rotina_diaria")

    # DEV: descomentar a linha abaixo para testar agora sem esperar às 08h
    
    scheduler.add_job(rotina_diaria, "date", id="rotina_diaria_teste")

    scheduler.start()
    logging.info("[scheduler] APScheduler iniciado")

    yield  # app rodando

    scheduler.shutdown(wait=False)
    logging.info("[scheduler] APScheduler encerrado")


app = FastAPI(title="Facilit API", version="1.0.0", lifespan=lifespan)

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
    return {"status": "ok", "versao": "TESTE_CORS_2026"}


# Endpoint para disparar a rotina manualmente (útil para testar no Railway)
@app.post("/api/admin/rotina-diaria", tags=["admin"])
def disparar_rotina_manual():
    from backend.scheduler import rotina_diaria
    rotina_diaria()
    return {"status": "ok", "mensagem": "Rotina executada"}