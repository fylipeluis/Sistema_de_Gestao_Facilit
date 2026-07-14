from datetime import date, datetime as dt
from mysql.connector import Error
from backend.database.connection import conectar
import logging

logger = logging.getLogger(__name__)


def marcar_parcelas_atrasadas():
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE cobrancas
            SET status = 'ATRASADO'
            WHERE status = 'PENDENTE'
            AND data_vencimento < CURDATE()
            """
        )
        afetadas = cursor.rowcount
        connection.commit()

        if afetadas > 0:
            logger.info(f"[scheduler] {afetadas} parcela(s) marcada(s) como ATRASADO")

    except Error as e:
        logger.error(f"[scheduler] Erro ao marcar atrasadas: {e}")
        if connection:
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def inativar_clientes_concluidos():
    """Inativa clientes cujas todas as parcelas estão PAGAS ou CANCELADAS."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT DISTINCT c.id_cliente
            FROM clientes c
            WHERE c.status_cliente = 'ATIVO'
            AND NOT EXISTS (
                SELECT 1 FROM cobrancas co
                WHERE co.id_cliente = c.id_cliente
                AND co.status IN ('PENDENTE', 'ATRASADO')
              )
            """
        )
        clientes = cursor.fetchall()

        if not clientes:
            return

        ids = [row["id_cliente"] for row in clientes]
        placeholders = ",".join(["%s"] * len(ids))

        cursor.execute(
            f"UPDATE clientes SET status_cliente = 'INATIVO' WHERE id_cliente IN ({placeholders})",
            ids,
        )
        connection.commit()
        logger.info(f"[scheduler] {len(ids)} cliente(s) inativado(s): {ids}")

    except Error as e:
        logger.error(f"[scheduler] Erro ao inativar clientes: {e}")
        if connection:
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def buscar_parcelas_do_dia():
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                co.id_cobranca,
                co.numero_parcela,
                co.valor_cobranca,
                co.pix_code,
                co.pix_expira_em,
                co.status,
                co.data_vencimento,
                cl.nome_completo,
                cl.telefone,
                f.qtd_parcelas
            FROM cobrancas co
            JOIN adm_faturas f  ON co.id_fatura   = f.id_fatura
            JOIN clientes   cl  ON co.id_cliente  = cl.id_cliente
            WHERE
                cl.status_cliente = 'ATIVO'
                AND co.status IN ('PENDENTE', 'ATRASADO')
                AND (co.ultima_mensagem IS NULL OR DATE(co.ultima_mensagem) < CURDATE())
                AND co.data_vencimento <= CURDATE()
            GROUP BY co.id_cobranca
            ORDER BY co.data_vencimento ASC
            """
        )
        return cursor.fetchall()

    except Error as e:
        logger.error(f"[scheduler] Erro ao buscar parcelas do dia: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def registrar_mensagem_enviada(id_cobranca: int):
    """Atualiza ultima_mensagem para agora após envio bem-sucedido."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()

        cursor.execute(
            "UPDATE cobrancas SET ultima_mensagem = NOW() WHERE id_cobranca = %s",
            (id_cobranca,),
        )
        connection.commit()

    except Error as e:
        logger.error(f"[scheduler] Erro ao registrar mensagem {id_cobranca}: {e}")
        if connection:
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def salvar_pix_gerado(id_cobranca: int, pix_code: str, payment_id: str, expira_em):
    """Salva os dados do Pix recém-gerado na parcela."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE cobrancas 
            SET pix_code = %s, mp_payment_id = %s, pix_expira_em = %s
            WHERE id_cobranca = %s
            """,
            (pix_code, payment_id, expira_em, id_cobranca),
        )
        connection.commit()

    except Error as e:
        logger.error(f"[scheduler] Erro ao salvar Pix gerado para {id_cobranca}: {e}")
        if connection:
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def rotina_diaria():
    logger.info("[scheduler] Iniciando rotina diária...")

    marcar_parcelas_atrasadas()

    parcelas = buscar_parcelas_do_dia()
    logger.info(f"[scheduler] {len(parcelas)} parcela(s) para notificar hoje")

    from backend.services.zapi_service import whatsapp_service, verificar_conexao
    from backend.services.alerta_service import alertar_admin
    from backend.services.mercadopago_service import gerar_pix

    zapi_ok = verificar_conexao()
    if not zapi_ok:
        alertar_admin(
            "🚨 Z-API desconectada — notificações de WhatsApp NÃO serão enviadas hoje.\n"
            "Acesse o painel do Z-API e reescaneie o QR Code.\n"
            "Até resolver, conclua os avisos de cobrança manualmente."
        )
        logger.warning("[scheduler] Z-API desconectada — pulando notificações desta rotina")

    for parcela in parcelas:
        try:
            pix_code = parcela.get("pix_code")
            pix_expira_em = parcela.get("pix_expira_em")

            precisa_gerar_pix = (
                not pix_code or
                not pix_expira_em or
                pix_expira_em < dt.utcnow()
            )

            if precisa_gerar_pix:
                try:
                    resultado_pix = gerar_pix(
                        id_cobranca=parcela["id_cobranca"],
                        valor=float(parcela["valor_cobranca"]),
                        descricao=f"Parcela {parcela['numero_parcela']}/{parcela['qtd_parcelas']} - {parcela['nome_completo']}",
                    )
                    pix_code = resultado_pix["qr_code"]
                    salvar_pix_gerado(
                        parcela["id_cobranca"],
                        pix_code,
                        resultado_pix["payment_id"],
                        resultado_pix["expira_em"],
                    )
                except Exception as e:
                    logger.error(f"[scheduler] Falha ao gerar Pix para parcela {parcela['id_cobranca']}: {e}")
                    pix_code = None

            if not zapi_ok:
                logger.info(f"[scheduler] Pulando notificação da parcela {parcela['id_cobranca']} — Z-API offline")
                continue

            enviado = whatsapp_service.enviar_lembrete(
                telefone=parcela["telefone"],
                nome=parcela["nome_completo"],
                numero_parcela=parcela["numero_parcela"],
                qtd_parcelas=parcela["qtd_parcelas"],
                valor=float(parcela["valor_cobranca"]),
                vencimento=parcela["data_vencimento"],
                pix_code=pix_code,
                status=parcela["status"],
            )
            if enviado:
                registrar_mensagem_enviada(parcela["id_cobranca"])
        except Exception as e:
            logger.error(f"[scheduler] Falha ao notificar parcela {parcela['id_cobranca']}: {e}")

    inativar_clientes_concluidos()

    logger.info("[scheduler] Rotina diária concluída")