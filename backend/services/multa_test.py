"""
Script de teste manual da lógica de acréscimo (juros) de 22h/00h.

USO:
    python -m backend.scripts.testar_multa resetar <id_cobranca>
    python -m backend.scripts.testar_multa 22h
    python -m backend.scripts.testar_multa 00h
    python -m backend.scripts.testar_multa status <id_cobranca>

Fluxo recomendado de teste:
    1. python -m backend.scripts.testar_multa resetar 999
    2. python -m backend.scripts.testar_multa 22h
       -> confere se chegou WhatsApp e se o valor/flags mudaram
    3. python -m backend.scripts.testar_multa status 999
    4. python -m backend.scripts.testar_multa 00h
    5. python -m backend.scripts.testar_multa status 999
    6. python -m backend.scripts.testar_multa resetar 999   (limpa pro próximo teste)

ATENÇÃO: "22h" e "00h" aqui rodam a lógica de verdade contra o banco
configurado no seu .env atual -- confirme se está apontando para o banco
de teste/local antes de rodar, não para produção com clientes reais.
"""
import sys
from dotenv import load_dotenv

load_dotenv()

from backend.database.connection import conectar  # noqa: E402


def resetar(id_cobranca: int, valor_base: float = 150.00):
    connection = conectar()
    cursor = connection.cursor()
    cursor.execute(
        """
        UPDATE cobrancas
        SET data_vencimento = CURDATE(),
            status = 'PENDENTE',
            valor_cobranca = %s,
            acrescimo_22h_aplicado = FALSE,
            acrescimo_00h_aplicado = FALSE,
            pix_code = NULL,
            mp_payment_id = NULL,
            pix_expira_em = NULL
        WHERE id_cobranca = %s
        """,
        (valor_base, id_cobranca),
    )
    connection.commit()
    afetadas = cursor.rowcount
    cursor.close()
    connection.close()

    if afetadas == 0:
        print(f"Nenhuma parcela encontrada com id_cobranca={id_cobranca}. Confirme o ID.")
    else:
        print(f"Parcela {id_cobranca} resetada: vencimento=hoje, valor={valor_base}, flags=FALSE.")


def mostrar_status(id_cobranca: int):
    connection = conectar()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id_cobranca, status, valor_cobranca, data_vencimento,
            acrescimo_22h_aplicado, acrescimo_00h_aplicado,
            pix_code IS NOT NULL AS tem_pix
        FROM cobrancas
        WHERE id_cobranca = %s
        """,
        (id_cobranca,),
    )
    parcela = cursor.fetchone()
    cursor.close()
    connection.close()

    if not parcela:
        print(f"Nenhuma parcela encontrada com id_cobranca={id_cobranca}.")
        return

    print("--- Status atual ---")
    for chave, valor in parcela.items():
        print(f"{chave}: {valor}")


def rodar_22h():
    from backend.scheduler import rotina_22h
    print("Rodando rotina_22h()...")
    rotina_22h()
    print("Concluído. Confira o WhatsApp e rode 'status <id>' para ver o resultado.")


def rodar_00h():
    from backend.scheduler import rotina_00h
    print("Rodando rotina_00h()...")
    rotina_00h()
    print("Concluído. Rode 'status <id>' para ver o resultado.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    comando = sys.argv[1]

    if comando == "resetar":
        if len(sys.argv) < 3:
            print("Uso: python -m backend.scripts.testar_multa resetar <id_cobranca>")
            sys.exit(1)
        resetar(int(sys.argv[2]))

    elif comando == "status":
        if len(sys.argv) < 3:
            print("Uso: python -m backend.scripts.testar_multa status <id_cobranca>")
            sys.exit(1)
        mostrar_status(int(sys.argv[2]))

    elif comando == "22h":
        rodar_22h()

    elif comando == "00h":
        rodar_00h()

    else:
        print(f"Comando desconhecido: {comando}")
        print(__doc__)
        sys.exit(1)