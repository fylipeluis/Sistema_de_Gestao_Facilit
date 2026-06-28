import os
import logging
import mercadopago
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN")
sdk = mercadopago.SDK(ACCESS_TOKEN)

HORAS_EXPIRACAO_PIX = 24


def gerar_pix(id_cobranca: int, valor: float, descricao: str) -> dict:
    """
    Gera um pagamento Pix via Mercado Pago.
    Retorna qr_code, qr_code_base64, payment_id e data de expiração.
    """
    data_expiracao = datetime.utcnow() + timedelta(hours=HORAS_EXPIRACAO_PIX)

    payment_data = {
        "transaction_amount": float(valor),
        "description": descricao,
        "payment_method_id": "pix",
        "external_reference": str(id_cobranca),
        "date_of_expiration": data_expiracao.strftime("%Y-%m-%dT%H:%M:%S.000-00:00"),
        "payer": {
            "email": f"cliente{id_cobranca}@facilitsolucoes.com"  # MP exige um email, mesmo fictício
        }
    }

    try:
        resultado = sdk.payment().create(payment_data)
        payment = resultado["response"]

        if resultado["status"] not in (200, 201):
            logger.error(f"[mercadopago] Erro ao gerar Pix: {payment}")
            raise Exception(f"Erro Mercado Pago: {payment.get('message', 'desconhecido')}")

        transaction_data = payment["point_of_interaction"]["transaction_data"]

        return {
            "payment_id": str(payment["id"]),
            "qr_code": transaction_data["qr_code"],
            "qr_code_base64": transaction_data["qr_code_base64"],
            "expira_em": data_expiracao,
        }

    except Exception as e:
        logger.error(f"[mercadopago] Falha ao gerar Pix para cobranca {id_cobranca}: {e}")
        raise


def consultar_pagamento(payment_id: str) -> dict:
    """
    Consulta o status real de um pagamento no Mercado Pago.
    Usado pelo webhook para confirmar antes de marcar como pago.
    """
    try:
        resultado = sdk.payment().get(payment_id)
        return resultado["response"]
    except Exception as e:
        logger.error(f"[mercadopago] Erro ao consultar pagamento {payment_id}: {e}")
        raise