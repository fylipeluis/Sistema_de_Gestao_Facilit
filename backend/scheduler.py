from datetime import date
from mysql.connector import Error
from backend.database.connection import conectar
import logging

logger = logging.getLogger(__name__)


def marcar_parcelas_atrasadas():
    """Muda para ATRASADO toda parcela PENDENTE cuja data_vencimento já passou."""
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

        # Clientes ATIVOS que não têm nenhuma parcela PENDENTE ou ATRASADA
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
    """
    Retorna parcelas que devem ser notificadas hoje.
    Regra: data_vencimento = hoje (PENDENTE) ou status ATRASADO,
    e que não receberam mensagem hoje ainda.
    """
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
                AND (
                    co.data_vencimento = CURDATE()      -- vence hoje (PENDENTE)
                    OR co.data_vencimento < CURDATE()   -- já venceu (ATRASADO)
                )
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


def rotina_diaria():
    """Orquestra tudo — chamada pelo APScheduler todo dia às 08h."""
    logger.info("[scheduler] Iniciando rotina diária...")

    # 1. Marcar atrasadas primeiro (antes de buscar para notificar)
    marcar_parcelas_atrasadas()

    # 2. Buscar o que notificar hoje
    parcelas = buscar_parcelas_do_dia()
    logger.info(f"[scheduler] {len(parcelas)} parcela(s) para notificar hoje")

    # 3. Enviar mensagens
    from backend.services.whatsapp import whatsapp_service
    for parcela in parcelas:
        try:
            enviado = whatsapp_service.enviar_lembrete(
                telefone=parcela["telefone"],
                nome=parcela["nome_completo"],
                numero_parcela=parcela["numero_parcela"],
                qtd_parcelas=parcela["qtd_parcelas"],
                valor=float(parcela["valor_cobranca"]),
                vencimento=parcela["data_vencimento"],
                pix_code=parcela["pix_code"],
                status=parcela["status"],
            )
            if enviado:
                registrar_mensagem_enviada(parcela["id_cobranca"])
        except Exception as e:
            logger.error(f"[scheduler] Falha ao notificar parcela {parcela['id_cobranca']}: {e}")
            # Continua para a próxima — falha em 1 não para as demais

    # 4. Inativar clientes com contrato concluído
    inativar_clientes_concluidos()

    logger.info("[scheduler] Rotina diária concluída")