import type { Fatura } from "../../../types/fatura";
import "./ResumoDetalhesAdm.css";

interface ResumoSectionProps {
  faturas: Fatura[];
}

export function ResumoSectionAdm({ faturas }: ResumoSectionProps) {
  const totalDebitos = faturas.reduce((acc, fatura) => {
    const totalFatura = fatura.parcelas.reduce(
      (soma, parcela) => soma + parcela.valor_cobranca,
      0,
    );
    return acc + totalFatura;
  }, 0);

  const valorQuitado = faturas
    .flatMap((f) => f.parcelas)
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + p.valor_cobranca, 0);

  const totalParcelas = faturas.reduce((acc, f) => acc + f.parcelas.length, 0);
  const parcelasPagas = faturas.reduce(
    (acc, f) =>
      acc +
      f.parcelas.filter(
        (p) => (p.status || "").toUpperCase() === "PAGO",
      ).length,
    0,
  );

  return (
    <section className="resumo-section">
      <div className="resumo-cards">
        <div className="resumo-card">
          <div className="resumo-label">Debito Total</div>
          <div className="resumo-valor">
            {totalDebitos.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Valor Quitado</div>
          <div className="resumo-valor" style={{ color: "#10b981" }}>
            {valorQuitado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        </div>

        <div className="resumo-card">
          <div className="resumo-label">Pendentes</div>
          <div className="resumo-valor" style={{ color: "#f59e0b" }}>
            {totalParcelas - parcelasPagas}
          </div>
        </div>
      </div>
    </section>
  );
}
