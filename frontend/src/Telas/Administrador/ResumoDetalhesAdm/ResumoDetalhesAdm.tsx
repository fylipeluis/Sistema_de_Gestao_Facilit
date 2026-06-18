import type { Fatura } from "../../../types/fatura";
import "./ResumoDetalhesAdm.css";

interface ResumoSectionProps {
  faturas: Fatura[];
}

export function ResumoSectionAdm({ faturas }: ResumoSectionProps) {
  const todasParcelas = faturas.flatMap((f) => f.parcelas);
  const hoje = new Date().toISOString().split("T")[0];

  // Card 1 — Valor total emprestado (sem juros, valor bruto dos contratos)
  const valorTotalEmprestado = faturas.reduce(
    (acc, f) => acc + f.valor_emprestimo,
    0,
  );

  // Card 2 — Parcelas que vencem hoje e ainda não foram pagas
  const parcelasVencendoHoje = todasParcelas.filter((p) => {
    const vencimento = p.data_vencimento?.split("T")[0];
    return (
      vencimento === hoje &&
      p.status?.toUpperCase() !== "PAGO" &&
      p.status?.toUpperCase() !== "CANCELADO"
    );
  }).length;

  // Card 3 — Valor em aberto (parcelas não pagas)
  const valorEmAberto = todasParcelas
    .filter(
      (p) =>
        p.status?.toUpperCase() !== "PAGO" &&
        p.status?.toUpperCase() !== "CANCELADO",
    )
    .reduce((acc, p) => acc + p.valor_cobranca, 0);

  return (
    <section className="resumo-section">
      <div className="resumo-cards">
        <div className="resumo-card">
          <div className="resumo-label">Total Emprestado</div>
          <div className="resumo-valor">
            {valorTotalEmprestado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Cobranças de Hoje</div>
          <div className="resumo-valor" style={{ color: "#f59e0b" }}>
            {parcelasVencendoHoje}
          </div>
          <div className="resumo-sublabel">parcela(s) a vencer hoje</div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Valor em Aberto</div>
          <div className="resumo-valor" style={{ color: "#ef4444" }}>
            {valorEmAberto.toLocaleString("pt-BR", {
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