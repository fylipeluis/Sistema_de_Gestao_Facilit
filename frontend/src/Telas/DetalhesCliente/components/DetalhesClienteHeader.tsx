interface DetalhesClienteHeaderProps {
  nomeCliente: string;
  onSair: () => void;
}

export function DetalhesClienteHeader({
  nomeCliente,
  onSair,
}: DetalhesClienteHeaderProps) {
  return (
    <div className="cliente-header">
      <div className="header-content">
        <h1>Bem-vindo, {nomeCliente}</h1>
        <p className="header-desc">
          Gerencie suas parcelas e visualize seus dados
        </p>
      </div>
      <button className="btn-sair" onClick={onSair}>
        Sair
      </button>
    </div>
  );
}
