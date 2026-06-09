from fastapi import APIRouter, HTTPException
from mysql.connector import Error
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
                SELECT id_cobranca, numero_parcela, valor_cobranca,
                COALESCE(status, 'Pendente') as status_cobranca
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
        if connection and connection.is_connected():
            cursor.close()
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
            cursor.execute(
                """
                INSERT INTO cobrancas (id_cliente, id_fatura, valor_cobranca, numero_parcela)
                VALUES (%s, %s, %s, %s)
                """,
                (dados.id_cliente, id_fatura, valor_parcela, i),
            )

        cursor.execute(
            "UPDATE clientes SET status_cliente = 'ATIVO' WHERE id_cliente = %s",
            (dados.id_cliente,),
        )

        connection.commit()
        return {"status": "sucesso", "mensagem": "Fatura criada", "id_fatura": id_fatura}
    except Error as e:
        if connection:
            connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()