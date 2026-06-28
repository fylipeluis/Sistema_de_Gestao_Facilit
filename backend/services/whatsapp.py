import logging
from datetime import date

logger = logging.getLogger(__name__)


class WhatsAppServiceMock:
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
        prefixo = "⚠️ ATRASADO —" if status == "ATRASADO" else ""

        mensagem = (
            f"{prefixo}Olá {nome}, "
            f"sua parcela {numero_parcela}/{qtd_parcelas} "
            f"de R$ {valor:.2f} "
            f"{'venceu em' if status == 'ATRASADO' else 'vence em'} "
            f"{vencimento.strftime('%d/%m/%Y')}."
        )

        if pix_code:
            mensagem += f"\n\nPague com Pix (copie e cole no app do seu banco):\n{pix_code}"
        else:
            mensagem += "\n\n(Não foi possível gerar o Pix automático — contate o suporte.)"

        logger.info(f"[whatsapp-mock] Para {telefone}: {mensagem}")
        return True


whatsapp_service = WhatsAppServiceMock()