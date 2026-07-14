import HeaderPaginaAdministrador from "./HeaderPaginaAdministrador/Header";
import { ResumoSectionAdm } from "./ResumoDetalhesAdm/ResumoDetalhesAdm";
import TabelaClientePaginaAdministrador from "./TabelaClientePaginaAdministrador/TabelaClientes";

export default function PaginaAdministrador() {

  return (
    <>
      <HeaderPaginaAdministrador />
      <ResumoSectionAdm />
      <TabelaClientePaginaAdministrador />
    </>
  );
}