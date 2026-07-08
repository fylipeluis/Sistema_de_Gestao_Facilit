import { useState } from "react";
import HeaderPaginaAdministrador from "./HeaderPaginaAdministrador/Header";
import { ResumoSectionAdm } from "./ResumoDetalhesAdm/ResumoDetalhesAdm";
import type { Secao } from "./SidebarPaginaAdministrador/SidebarPaginaAdm";
import TabelaClientes from "./TabelaClientePaginaAdministrador/TabelaClientes";
import Sidebar from "./SidebarPaginaAdministrador/SidebarPaginaAdm"
import "./adm.css";

export default function PaginaAdministrador() {
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>("dashboard");

  return (

    <div className="layout">

      <Sidebar
        secaoAtiva={secaoAtiva}
        onSelecionar={setSecaoAtiva}
      />

      <div className="content">
        <HeaderPaginaAdministrador />

        <main className="app-main">
          {secaoAtiva === "dashboard" && (
            <>
              <ResumoSectionAdm />
              <TabelaClientes />
            </>
          )}

          {secaoAtiva === "clientes" && <p>Clientes</p>}
          {secaoAtiva === "contratos" && <p>Contratos</p>}
          {secaoAtiva === "cobrancas" && <p>Cobranças</p>}
          {secaoAtiva === "pagamentos" && <p>Pagamentos</p>}
          {secaoAtiva === "relatorios" && <p>Relatórios</p>}
        </main>
      </div>
    </div>
  );
}
