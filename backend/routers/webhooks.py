import logging
from fastapi import APIRouter, Request, HTTPException
from mysql.connector import Error
from backend.database.connection import conectar
from backend.services.mercadopago_service import consultar_pagamento

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)



@router.post("/mercadopago")
async def webhook_mercadopago(request: Request):
    print("====== WEBHOOK RECEBIDO ======")

    dados = await request.json()
    
    try:
        logger.warning("WEBHOOK EXECUTADO")
        dados = await request.json()
        logger.info(f"[webhook] Notificação recebida: {dados}")

        # O Mercado Pago manda o tipo e o ID do recurso
        tipo = dados.get("type") or dados.get("topic")
        payment_id = None

        if tipo == "payment":
            payment_id = dados.get("data", {}).get("id")
        elif "data.id" in dados:
            payment_id = dados.get("data.id")

        if not payment_id:
            logger.warning("[webhook] Notificação sem payment_id, ignorando")
            return {"status": "ignorado"}

        # PASSO CRÍTICO: confirma direto com o Mercado Pago, não confia na notificação
        pagamento = consultar_pagamento(payment_id)
        logger.info(f"[webhook] Resposta Mercado Pago: {pagamento}")
        
        status_pagamento = pagamento.get("status")
        external_reference = pagamento.get("external_reference")

        logger.info(
            f"[webhook] payment_id={payment_id} | "
            f"status={status_pagamento} | "
            f"external_reference={external_reference}"
        )

        if status_pagamento != "approved":
            logger.info(f"[webhook] Pagamento {payment_id} ainda não aprovado ({status_pagamento})")
            return {"status": "recebido", "aprovado": False}
        
        if not external_reference:
            logger.warning(
                f"[webhook] Pagamento {payment_id} aprovado mas sem external_reference"
            )
            return {"status": "erro", "mensagem": "Sem referência da parcela"}

        try:
            id_cobranca = int(external_reference)
        except ValueError:
            logger.error(
                f"[webhook] external_reference inválido: {external_reference}"
            )
            return {"status": "erro", "mensagem": "external_reference inválido"}

        resultado = marcar_parcela_paga_interno(id_cobranca)

        return {"status": "sucesso", "parcela_atualizada": resultado}

    except Exception as e:
        logger.exception("[webhook] Erro ao marcar parcela paga")
        # Retorna 200 mesmo em erro interno para o MP não ficar reenviando indefinidamente
        return {"status": "erro", "mensagem": str(e)}


def marcar_parcela_paga_interno(id_cobranca: int) -> dict:
    """Mesma lógica do endpoint manual de pagar parcela, reaproveitada aqui."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT id_cobranca, id_cliente, status FROM cobrancas WHERE id_cobranca = %s",
            (id_cobranca,),
        )
        parcela = cursor.fetchone()

        if not parcela:
            logger.warning(f"[webhook] Parcela {id_cobranca} não encontrada no banco.")
            return {"encontrada": False}

        if parcela["status"] == "PAGO":
            logger.info(f"[webhook] Parcela {id_cobranca} já estava paga")
            return {"ja_estava_pago": True}

        cursor.execute(
            "UPDATE cobrancas SET status = 'PAGO' WHERE id_cobranca = %s",
            (id_cobranca,),
        )

        id_cliente = parcela["id_cliente"]
        cursor.execute(
            """
            SELECT COUNT(*) as pendentes
            FROM cobrancas
            WHERE id_cliente = %s AND status NOT IN ('PAGO', 'CANCELADO')
            """,
            (id_cliente,),
        )
        resultado = cursor.fetchone()
        logger.info(f"[webhook] Cliente {id_cliente} possui "f"{resultado['pendentes']} parcelas pendentes.")
        cliente_concluido = resultado["pendentes"] == 0

        if cliente_concluido:
            logger.info(f"[webhook] Atualizando parcela {id_cobranca} para PAGO")
            cursor.execute(
                "UPDATE clientes SET status_cliente = 'INATIVO' WHERE id_cliente = %s",
                (id_cliente,),
            )

        connection.commit()
        logger.info(f"[webhook] Parcela {id_cobranca} marcada como PAGO automaticamente")

        return {"pago": True, "cliente_inativado": cliente_concluido}

    except Error as e:
        if connection:
            connection.rollback()
        logger.exception("[webhook] Erro ao marcar parcela paga")
        return {"erro": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()