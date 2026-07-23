from pydantic import BaseModel
from datetime import date


class ClienteUpdate(BaseModel):
    nome_completo: str = None
    telefone: str = None
    documento: str = None

    class Config:
        from_attributes = True

class ClienteAtivarComFatura(BaseModel):
    valor_emprestimo: float
    qtd_parcelas: int
    inicio_cobranca: date
    taxa_juros: float | None = None

    class Config:
        from_attributes = True
