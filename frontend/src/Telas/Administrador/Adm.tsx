import { useState } from "react";
import HeaderPaginaAdministrador from "./HeaderPaginaAdministrador/Header";
import { ResumoSectionAdm } from "./ResumoDetalhesAdm/ResumoDetalhesAdm";
import type { Secao } from "./SidebarPaginaAdministrador/SidebarPaginaAdm";
import TabelaClientes from "./TabelaClientePaginaAdministrador/TabelaClientes";
import Sidebar from "./SidebarPaginaAdministrador/SidebarPaginaAdm"

export default function PaginaAdministrador() {
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>("dashboard");

  return (
    <>
      <HeaderPaginaAdministrador />
      <Sidebar secaoAtiva={secaoAtiva} onSelecionar={setSecaoAtiva} />

      <main className="app-main">
        {secaoAtiva === "dashboard" && (
          <>
            <ResumoSectionAdm />
            <TabelaClientes />
          </>
        )}

        {secaoAtiva === "clientes" && <p>Seção Clientes — a implementar</p>}
        {secaoAtiva === "contratos" && <p>Seção Contratos — a implementar</p>}
        {secaoAtiva === "cobrancas" && <p>Seção Cobranças — a implementar</p>}
        {secaoAtiva === "pagamentos" && <p>Seção Pagamentos — a implementar</p>}
        {secaoAtiva === "relatorios" && <p>Seção Relatórios — a implementar</p>}
      </main>
    </>
  );
}