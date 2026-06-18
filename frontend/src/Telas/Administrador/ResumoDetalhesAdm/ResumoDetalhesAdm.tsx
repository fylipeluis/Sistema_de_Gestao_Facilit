import { useResumo } from "../../../hooks/useResumo";
import "./ResumoDetalhesAdm.css";

export function ResumoSectionAdm() {
  const { resumo } = useResumo();

  return (
    <section className="resumo-section">
      <div className="resumo-cards">
        <div className="resumo-card">
          <div className="resumo-label">Total Emprestado</div>
          <div className="resumo-valor">
            {(resumo.total_emprestado ?? 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Cobranças de Hoje</div>
          <div className="resumo-valor" style={{ color: "#f59e0b" }}>
            {resumo.cobrancas_hoje ?? 0}
          </div>
          <div className="resumo-sublabel">parcela(s) a vencer hoje</div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Valor em Aberto</div>
          <div className="resumo-valor" style={{ color: "#ef4444" }}>
            {(resumo.valor_em_aberto ?? 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <div className="resumo-sublabel">pendente + atrasado</div>
        </div>
      </div>
    </section>
  );
}