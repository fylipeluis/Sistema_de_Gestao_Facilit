import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClienteData } from "./hooks/useClienteData";
import { DetalhesClienteHeader } from "./components/DetalhesClienteHeader";
import { DadosClienteSection } from "./components/DadosClienteSection";
import { ResumoSection } from "./components/ResumoSection";
import { ParcelasSection } from "./components/ParcelasSection";
import { ModalPagamento } from "./components/ModalPagamento";
import "./DetalhesCliente.css";

export function DetalhesCliente() {
  const navigate = useNavigate();
  const { cliente, faturas, carregando, erro } = useClienteData();
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [parcelaAtual, setParcelaAtual] = useState<number | null>(null);

  function handleSair() {
    localStorage.removeItem("cpfCliente");
    navigate("/login");
  }

  function handlePagar(id_parcela: number) {
    setParcelaAtual(id_parcela);
    setShowPagamentoModal(true);
  }

  // Loading State
  if (carregando) {
    return (
      <div className="cliente-page">
        <div className="cliente-header">
          <h1>Carregando...</h1>
          <button className="btn-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (erro) {
    return (
      <div className="cliente-page">
        <div className="cliente-header">
          <h1>Erro</h1>
          <button className="btn-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
        <div className="cliente-container">
          <p className="erro-mensagem">{erro}</p>
        </div>
      </div>
    );
  }

  // No client found
  if (!cliente) {
    return (
      <div className="cliente-page">
        <div className="cliente-header">
          <h1>Dados do Cliente</h1>
          <button className="btn-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
        <div className="cliente-container">
          <p>Nenhum cliente encontrado</p>
        </div>
      </div>
    );
  }

  // Get payment valor
  const valorParcela =
    faturas
      .flatMap((f) => f.parcelas)
      .find((p) => p.id_cobranca === parcelaAtual)?.valor_cobranca || 0;

  return (
    <div className="cliente-page">
      <DetalhesClienteHeader
        nomeCliente={cliente.nome_completo}
        onSair={handleSair}
      />

      <div className="cliente-container">
        <DadosClienteSection cliente={cliente} />
        <ResumoSection faturas={faturas} />
        <ParcelasSection faturas={faturas} onPagar={handlePagar} />
      </div>

      {showPagamentoModal && (
        <ModalPagamento
          parcelaId={parcelaAtual}
          valor={valorParcela}
          onFechar={() => {
            setShowPagamentoModal(false);
            setParcelaAtual(null);
          }}
        />
      )}
    </div>
  );
}
