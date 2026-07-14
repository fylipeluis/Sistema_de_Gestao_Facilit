# backend/services/teste_alerta.py
from dotenv import load_dotenv
load_dotenv()

from backend.services.alerta_service import alertar_admin

if __name__ == "__main__":
    alertar_admin("🔔 Teste de alerta — se você recebeu isso, está funcionando.")