from datetime import date
from pydantic import BaseModel


class FaturaCreate(BaseModel):
    id_cliente: int
    valor_emprestimo: float
    qtd_parcelas: int
    inicio_cobranca: date
    taxa_juros: float | None = None
    
    class Config:
        from_attributes = True

