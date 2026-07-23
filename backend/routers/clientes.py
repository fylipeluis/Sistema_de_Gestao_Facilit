from fastapi import APIRouter, HTTPException, Request
from mysql.connector import Error
from datetime import timedelta
from backend.database.connection import conectar
from backend.schemas.cliente import ClienteUpdate, ClienteAtivarComFatura

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("/webhook-forms")
async def receber_dados_forms(request: Request):
    connection = None
    cursor = None
    try:
        dados = await request.json()
        connection = conectar()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO clientes (nome_completo, telefone, documento, status_cliente) VALUES (%s, %s, %s, %s)",
            (dados.get("nome"), dados.get("telefone"), dados.get("documento"), "PENDENTE"),
        )
        connection.commit()
        return {"status": "sucesso", "mensagem": "Cliente salvo no banco"}
    except Error as e:
        return {"status": "erro", "mensagem": str(e)}
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


@router.get("/")
def listar_clientes():
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                    c.id_cliente,
                    c.nome_completo,
                    c.status_cliente,

                    (
                        SELECT COALESCE(SUM(f.valor_emprestimo),0)
                        FROM adm_faturas f
                        WHERE f.id_cliente = c.id_cliente
                    ) AS valor_emprestado,

                    (
                        SELECT COALESCE(SUM(co.valor_cobranca),0)
                        FROM cobrancas co
                        WHERE co.id_cliente = c.id_cliente
                        AND co.status IN ('PENDENTE','ATRASADO')
                    ) AS valor_em_aberto,

                    (
                        SELECT COUNT(*)
                        FROM cobrancas co
                        WHERE co.id_cliente = c.id_cliente
                        AND co.status IN ('PENDENTE','ATRASADO')
                    ) AS parcelas_em_aberto

            FROM clientes c;
            """
        )
        return cursor.fetchall()
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@router.get("/documento/{documento}")
def obter_cliente_por_documento(documento: str):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                id_cliente,
                nome_completo,
                documento,
                telefone,
                status_cliente
            FROM clientes
            WHERE documento = %s
            LIMIT 1
            """,
            (documento,),
        )

        cliente = cursor.fetchone()

        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        return cliente

    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


@router.get("/{id}")
def obter_cliente(id: int):
    """Detalhe do cliente, incluindo CPF/telefone -- usado só pelo modal de contratos."""
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_cliente, nome_completo, documento, telefone, status_cliente FROM clientes WHERE id_cliente = %s",
            (id,),
        )
        cliente = cursor.fetchone()

        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        return cliente
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@router.put("/{id}")
def atualizar_cliente(id: int, dados: ClienteUpdate):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE clientes
            SET nome_completo = %s,
                documento     = %s,
                telefone      = %s
            WHERE id_cliente = %s
            """,
            (dados.nome_completo, dados.documento, dados.telefone, id),
        )
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        return {"status": "sucesso", "mensagem": "Cliente atualizado"}
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


@router.delete("/{id}")
def excluir_cliente(id: int):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM clientes WHERE id_cliente = %s", (id,))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        return {"status": "sucesso", "mensagem": "Cliente excluído"}
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


@router.post("/{id}/ativar-com-fatura")
def ativar_cliente_com_fatura(id: int, dados: ClienteAtivarComFatura):
    connection = None
    cursor = None
    try:
        connection = conectar()
        cursor = connection.cursor()

        cursor.execute("SELECT id_cliente FROM clientes WHERE id_cliente = %s", (id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        cursor.execute(
            """
            INSERT INTO adm_faturas (id_cliente, valor_emprestimo, qtd_parcelas, inicio_cobranca)
            VALUES (%s, %s, %s, %s)
            """,
            (id, dados.valor_emprestimo, dados.qtd_parcelas, dados.inicio_cobranca),
        )
        id_fatura = cursor.lastrowid
        
        valor_total = dados.valor_emprestimo

        if dados.taxa_juros is not None:
            valor_total = (
            dados.valor_emprestimo *
            (1 + (dados.taxa_juros / 100) * dados.qtd_parcelas)
        )
            
        valor_parcela = round(valor_total / dados.qtd_parcelas, 2)
        
        for i in range(1, dados.qtd_parcelas + 1):
            data_vencimento = dados.inicio_cobranca + timedelta(days=i - 1)

            cursor.execute(
                """
                INSERT INTO cobrancas 
                    (id_cliente, id_fatura, valor_cobranca, numero_parcela, data_vencimento, status)
                VALUES (%s, %s, %s, %s, %s, 'PENDENTE')
                """,
                (id, id_fatura, valor_parcela, i, data_vencimento),
            )

        cursor.execute(
            "UPDATE clientes SET status_cliente = 'ATIVO' WHERE id_cliente = %s",
            (id,),
        )

        connection.commit()
        return {"status": "sucesso", "mensagem": "Cliente ativado com fatura criada", "id_fatura": id_fatura}
    except Error as e:
        if connection:
            connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
