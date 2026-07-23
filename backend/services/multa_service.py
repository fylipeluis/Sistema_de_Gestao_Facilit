import os
import logging
from mysql.connector import Error
from backend.database.connection import conectar

VALOR_ACRESCIMO = float(os.getenv("VALOR_ACRESCIMO_ATRASO"))


logger = logging.getLogger(__name__)



def aplicar_acrescimo_22h():
    """Aplica R$12 nas parcelas que vencem HOJE e ainda estão PENDENTE, uma única vez."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id_cobranca, valor_cobranca
            FROM cobrancas
            WHERE status = 'PENDENTE'
            AND data_vencimento = CURDATE()
            AND acrescimo_22h_aplicado = FALSE
            """
        )
        parcelas = cursor.fetchall()

        for parcela in parcelas:
            novo_valor = float(parcela["valor_cobranca"]) + VALOR_ACRESCIMO
            cursor.execute(
                """
                UPDATE cobrancas
                SET valor_cobranca = %s,
                    acrescimo_22h_aplicado = TRUE,
                    pix_code = NULL,
                    mp_payment_id = NULL,
                    pix_expira_em = NULL
                WHERE id_cobranca = %s
                """,
                (novo_valor, parcela["id_cobranca"]),
            )

        connection.commit()
        logger.info(f"[multa] Acréscimo 22h aplicado em {len(parcelas)} parcela(s)")
        return parcelas

    except Error as e:
        logger.error(f"[multa] Erro ao aplicar acréscimo 22h: {e}")
        if connection:
            connection.rollback()
        return []
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def aplicar_acrescimo_00h():
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id_cobranca, valor_cobranca
            FROM cobrancas
            WHERE status IN ('PENDENTE', 'ATRASADO')
            AND acrescimo_22h_aplicado = TRUE
            AND acrescimo_00h_aplicado = FALSE
            """
        )
        parcelas = cursor.fetchall()

        for parcela in parcelas:
            novo_valor = float(parcela["valor_cobranca"]) + VALOR_ACRESCIMO
            cursor.execute(
                """
                UPDATE cobrancas
                SET valor_cobranca = %s,
                    acrescimo_00h_aplicado = TRUE,
                    pix_code = NULL,
                    mp_payment_id = NULL,
                    pix_expira_em = NULL
                WHERE id_cobranca = %s
                """,
                (novo_valor, parcela["id_cobranca"]),
            )

        connection.commit()
        logger.info(f"[multa] Acréscimo 00h aplicado em {len(parcelas)} parcela(s)")
        return parcelas

    except Error as e:
        logger.error(f"[multa] Erro ao aplicar acréscimo 00h: {e}")
        if connection:
            connection.rollback()
        return []
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()