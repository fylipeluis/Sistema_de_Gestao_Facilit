from dotenv import load_dotenv
load_dotenv()

from backend.services.zapi_service import verificar_conexao

if __name__ == "__main__":
    conectado = verificar_conexao()
    print(f"Instância conectada: {conectado}")