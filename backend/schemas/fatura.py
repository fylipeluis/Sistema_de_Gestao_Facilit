from datetime import date

from pydantic import BaseModel


class FaturaCreate(BaseModel):
    id_cliente: int
    valor_emprestimo: float
    qtd_parcelas: int
    inicio_cobranca: date
    
    class Config:
        from_attributes = True
