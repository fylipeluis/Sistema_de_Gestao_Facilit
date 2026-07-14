# backend/services/alerta_service.py
import os
import logging
import requests

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def alertar_admin(mensagem: str):
    """
    Envia um alerta pro administrador via Telegram.
    Usado quando algo crítico falha (ex: Z-API desconectada) e precisa
    de ação manual até o problema ser resolvido.
    """
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": mensagem,
    }

    try:
        resposta = requests.post(url, json=payload, timeout=10)
        resposta.raise_for_status()
        logger.info("[alerta] Notificação enviada ao administrador via Telegram")
    except requests.exceptions.RequestException as e:
        # Última linha de defesa — se nem isso funcionar, ao menos loga com destaque
        logger.critical(f"[alerta] FALHA AO ENVIAR ALERTA DE EMERGÊNCIA: {e}")