import type { ClienteDetalhes } from "../../../types/cliente";
import { getStatusClass } from "../utils/statusUtils";

interface DadosClienteSectionProps {
  cliente: ClienteDetalhes;
}

export function DadosClienteSection({ cliente }: DadosClienteSectionProps) {
  return (
    <section className="dados-cliente-section">
      <div className="section-header">
        <h2>Meus Dados</h2>
        <p className="section-desc">
          Informações de cadastro (apenas visualização)
        </p>
      </div>

      <div className="dados-grid">
        <div className="dado-item">
          <label>Nome Completo</label>
          <div className="dado-valor">{cliente.nome_completo}</div>
        </div>

        <div className="dado-item">
          <label>CPF</label>
          <div className="dado-valor">{cliente.documento}</div>
        </div>

        <div className="dado-item">
          <label>Telefone</label>
          <div className="dado-valor">{cliente.telefone}</div>
        </div>

        <div className="dado-item">
          <label>Status</label>
          <div
            className={`dado-valor status ${getStatusClass(cliente.status_cliente)}`}
          >
            {cliente.status_cliente}
          </div>
        </div>
      </div>
    </section>
  );
}
