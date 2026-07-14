import os
import logging
import requests

logger = logging.getLogger(__name__)

ZAPI_INSTANCE_ID = os.getenv("ZAPI_INSTANCE_ID")
ZAPI_TOKEN = os.getenv("ZAPI_TOKEN")
ZAPI_CLIENT_TOKEN = os.getenv("ZAPI_CLIENT_TOKEN")

BASE_URL = f"https://api.z-api.io/instances/{ZAPI_INSTANCE_ID}/token/{ZAPI_TOKEN}"


def verificar_conexao() -> bool:
    """
    Retorna True se a instância está conectada ao WhatsApp, False caso contrário.
    """
    url = f"{BASE_URL}/status"
    headers = {"Client-Token": ZAPI_CLIENT_TOKEN}

    try:
        resposta = requests.get(url, headers=headers, timeout=10)
        resposta.raise_for_status()
        dados = resposta.json()
        return dados.get("connected", False)
    except requests.exceptions.RequestException as e:
        logger.error(f"[zapi] Erro ao verificar status da instância: {e}")
        return False


def _formatar_telefone(telefone: str) -> str:
    """
    Garante o formato que a Z-API espera: DDI + DDD + número, só dígitos.
    Ex: '(61) 99999-9999' -> '5561999999999'
    """
    apenas_digitos = "".join(filter(str.isdigit, telefone))

    # Se não vier com o DDI do Brasil (55), adiciona
    if not apenas_digitos.startswith("55"):
        apenas_digitos = "55" + apenas_digitos

    return apenas_digitos


class WhatsAppServiceZAPI:

    def enviar_lembrete(
        self,
        telefone: str,
        nome: str,
        numero_parcela: int,
        qtd_parcelas: int,
        valor: float,
        vencimento,
        pix_code: str | None,
        status: str,
    ) -> bool:
        prefixo = "⚠️ ATRASADO — " if status == "ATRASADO" else ""

        mensagem = (
        f"{prefixo}📢 *Lembrete de Pagamento – Facility*\n\n"
        f"Olá, {nome}!\n\n"
        f"Verificamos que, até o momento, o pagamento da sua "
        f"parcela *{numero_parcela}/{qtd_parcelas}*, no valor de "
        f"*R$ {valor:.2f}*, "
        f"{'com vencimento em' if status != 'ATRASADO' else 'que venceu em'} "
        f"*{vencimento.strftime('%d/%m/%Y')}*, ainda não foi identificado em nosso sistema.\n\n"
        f"📢 Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem."
    )


        if pix_code:
            mensagem += f"\n\nPague com Pix (copie e cole no app do seu banco):\n{pix_code}"
        else:
            mensagem += "\n\n(Não foi possível gerar o Pix automático — contate o suporte.)"

        return self._enviar_texto(telefone, mensagem)

    def _enviar_texto(self, telefone: str, mensagem: str) -> bool:
        url = f"{BASE_URL}/send-text"
        headers = {
            "Content-Type": "application/json",
            "Client-Token": ZAPI_CLIENT_TOKEN,
        }
        payload = {
            "phone": _formatar_telefone(telefone),
            "message": mensagem,
        }

        try:
            resposta = requests.post(url, json=payload, headers=headers, timeout=10)
            resposta.raise_for_status()
            logger.info(f"[zapi] Mensagem enviada para {telefone}")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"[zapi] Falha ao enviar mensagem para {telefone}: {e}")
            return False


whatsapp_service = WhatsAppServiceZAPI()