import { Wallet, CalendarClock, TrendingUp } from "lucide-react";
import { useResumo } from "../../../hooks/useResumo";
import "./ResumoDetalhesAdm.css";

export function ResumoSectionAdm() {
  const { resumo } = useResumo();

  return (
    <section className="resumo-cliente">
      <div className="resumo-containers">

        {/* Total Emprestado */}
        <div className="resumo-container">
          <div className="resumo-icon">
            <Wallet size={28} />
          </div>

          <div className="resumo-info">
            <span className="label-resumo">
              Total Emprestado
            </span>

            <h2 className="valor-resumo destaque-amarelo">
              {(resumo.total_emprestado ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h2>

            <span className="resumo-sublabel">
              Valor total emprestado
            </span>
          </div>
        </div>

        {/* Cobranças de Hoje */}
        <div className="resumo-container">
          <div className="resumo-icon">
            <CalendarClock size={28} />
          </div>

          <div className="resumo-info">
            <span className="label-resumo">
              Cobranças de Hoje
            </span>

            <h2 className="valor-resumo">
              {resumo.cobrancas_hoje ?? 0}
            </h2>

            <span className="resumo-sublabel">
              parcela(s) a vencer hoje
            </span>
          </div>
        </div>

        {/* Valor em Aberto */}
        <div className="resumo-container">
          <div className="resumo-icon">
            <TrendingUp size={28} />
          </div>

          <div className="resumo-info">
            <span className="label-resumo">
              Valor em Aberto
            </span>

            <h2 className="valor-resumo destaque-vermelho">
              {(resumo.valor_em_aberto ?? 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h2>

            <span className="resumo-sublabel">
              pendente + atrasado
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}