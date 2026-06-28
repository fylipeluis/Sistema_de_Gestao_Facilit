import logging
from datetime import date

logger = logging.getLogger(__name__)


class WhatsAppServiceMock:
    """
    Mock para desenvolvimento — só loga no console.
    Troque por implementação real quando escolher o fornecedor.
    """

    def enviar_lembrete(
        self,
        telefone: str,
        nome: str,
        numero_parcela: int,
        qtd_parcelas: int,
        valor: float,
        vencimento: date,
        pix_code: str | None,
        status: str,
    ) -> bool:
        """Retorna True se enviou com sucesso, False se falhou."""

        prefixo = "⚠️ ATRASADO —" if status == "ATRASADO" else ""

        mensagem = (
            f"{prefixo}Olá {nome}, "
            f"sua parcela {numero_parcela}/{qtd_parcelas} "
            f"de R$ {valor:.2f} "
            f"{'venceu em' if status == 'ATRASADO' else 'vence em'} "
            f"{vencimento.strftime('%d/%m/%Y')}."
        )

        if pix_code:
            mensagem += f" Pix: {pix_code}"

        logger.info(f"[whatsapp-mock] Para {telefone}: {mensagem}")
        return True


# Instância global — quando tiver fornecedor real, troca só aqui
whatsapp_service = WhatsAppServiceMock()