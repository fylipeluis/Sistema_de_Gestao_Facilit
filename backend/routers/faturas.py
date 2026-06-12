from fastapi import APIRouter, HTTPException
from mysql.connector import Error
from datetime import timedelta
from backend.database.connection import conectar
from backend.schemas.fatura import FaturaCreate

router = APIRouter(prefix="/faturas", tags=["faturas"])


@router.get("/cliente/{id_cliente}")
def obter_contratos_cliente(id_cliente: int):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id_fatura, id_cliente, valor_emprestimo, qtd_parcelas, inicio_cobranca
            FROM adm_faturas
            WHERE id_cliente = %s
            ORDER BY id_fatura DESC
            """,
            (id_cliente,),
        )
        faturas = cursor.fetchall()

        result = []
        for fatura in faturas:
            cursor.execute(
                """
                SELECT 
                    id_cobranca,
                    numero_parcela,
                    valor_cobranca,
                    data_vencimento,
                    status,
                    ultima_mensagem
                FROM cobrancas
                WHERE id_fatura = %s
                ORDER BY numero_parcela ASC
                """,
                (fatura["id_fatura"],),
            )
            parcelas = cursor.fetchall()
            result.append({**fatura, "parcelas": parcelas})

        return result

    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@router.post("/")
def criar_fatura(dados: FaturaCreate):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO adm_faturas (id_cliente, valor_emprestimo, qtd_parcelas, inicio_cobranca)
            VALUES (%s, %s, %s, %s)
            """,
            (dados.id_cliente, dados.valor_emprestimo, dados.qtd_parcelas, dados.inicio_cobranca),
        )
        id_fatura = cursor.lastrowid

        valor_parcela = round(dados.valor_emprestimo / dados.qtd_parcelas, 2)

        for i in range(1, dados.qtd_parcelas + 1):
            # Parcela 1 vence no dia inicio_cobranca, parcela 2 no dia seguinte, etc.
            data_vencimento = dados.inicio_cobranca + timedelta(days=i - 1)

            cursor.execute(
                """
                INSERT INTO cobrancas 
                    (id_cliente, id_fatura, valor_cobranca, numero_parcela, data_vencimento, status)
                VALUES (%s, %s, %s, %s, %s, 'PENDENTE')
                """,
                (dados.id_cliente, id_fatura, valor_parcela, i, data_vencimento),
            )

        cursor.execute(
            "UPDATE clientes SET status_cliente = 'ATIVO' WHERE id_cliente = %s",
            (dados.id_cliente,),
        )

        connection.commit()
        return {
            "status": "sucesso",
            "mensagem": "Fatura criada",
            "id_fatura": id_fatura,
        }

    except Error as e:
        if connection:
            connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@router.patch("/parcelas/{id_cobranca}/pagar")
def marcar_parcela_paga(id_cobranca: int):
    """Baixa manual de parcela pelo painel."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        # Verifica se a parcela existe e não está já paga
        cursor.execute(
            "SELECT id_cobranca, id_cliente, status FROM cobrancas WHERE id_cobranca = %s",
            (id_cobranca,),
        )
        parcela = cursor.fetchone()

        if not parcela:
            raise HTTPException(status_code=404, detail="Parcela não encontrada")

        if parcela["status"] == "PAGO":
            raise HTTPException(status_code=400, detail="Parcela já está paga")

        if parcela["status"] == "CANCELADO":
            raise HTTPException(status_code=400, detail="Parcela cancelada não pode ser baixada")

        # Marca a parcela como paga
        cursor.execute(
            "UPDATE cobrancas SET status = 'PAGO' WHERE id_cobranca = %s",
            (id_cobranca,),
        )

        # Verifica se todas as parcelas do cliente estão pagas -> inativa o cliente
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

        cliente_concluido = resultado["pendentes"] == 0

        if cliente_concluido:
            cursor.execute(
                "UPDATE clientes SET status_cliente = 'INATIVO' WHERE id_cliente = %s",
                (id_cliente,),
            )

        connection.commit()

        return {
            "status": "sucesso",
            "mensagem": "Parcela marcada como paga",
            "cliente_inativado": cliente_concluido,
        }

    except HTTPException:
        raise
    except Error as e:
        if connection:
            connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()