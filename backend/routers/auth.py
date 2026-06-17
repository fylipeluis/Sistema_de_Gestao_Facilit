import os
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "facilit-secret-dev")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8

ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


class LoginInput(BaseModel):
    usuario: str
    senha: str


def criar_token(usuario: str) -> str:
    expira = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": usuario, "exp": expira},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verificar_token(token: str) -> bool:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except Exception:
        return False


@router.post("/admin/login")
def login_admin(dados: LoginInput):
    if dados.usuario != ADMIN_USER or dados.senha != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    token = criar_token(dados.usuario)
    logger.info(f"[auth] Login admin: {dados.usuario}")
    return {"token": token}