import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from backend.routers import clientes, faturas, auth
from backend.routers.auth import verificar_token
from backend.routers import clientes, faturas, auth, webhooks


load_dotenv()
logging.basicConfig(level=logging.INFO)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.scheduler import rotina_diaria

    scheduler.add_job(rotina_diaria, "cron", hour=8, minute=0, id="rotina_diaria")
    scheduler.start()
    logging.info("[scheduler] APScheduler iniciado")

    yield

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
app.include_router(auth.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "versao": "FACILIT_V2"}


@app.post("/api/admin/rotina-diaria", tags=["admin"])
def disparar_rotina_manual(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not verificar_token(token):
        raise HTTPException(status_code=401, detail="Não autorizado")

    from backend.scheduler import rotina_diaria
    rotina_diaria()
    return {"status": "ok", "mensagem": "Rotina executada"}