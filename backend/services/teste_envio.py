from dotenv import load_dotenv
load_dotenv()

from datetime import date
from backend.services.zapi_service import whatsapp_service

if __name__ == "__main__":
    resultado = whatsapp_service.enviar_lembrete(
        telefone="61993580799",  # ex: 61999999999
        nome="Plínio Augusto",
        numero_parcela=1,
        qtd_parcelas=3,
        valor=150.00,
        vencimento=date.today(),
        pix_code="00020126...",  
        status="PENDENTE",
    )
    print(f"Enviado: {resultado}")