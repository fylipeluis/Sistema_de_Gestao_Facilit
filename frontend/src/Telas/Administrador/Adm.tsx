import HeaderPaginaAdministrador from "./HeaderPaginaAdministrador/Header";
import { ResumoSectionAdm } from "./ResumoDetalhesAdm/ResumoDetalhesAdm";
import TabelaClientes from "./TabelaClientePaginaAdministrador/TabelaClientes";

export default function PaginaAdministrador() {
  return (
    <>
      <HeaderPaginaAdministrador />
      <ResumoSectionAdm faturas={[]} />
      <TabelaClientes/>
    </>
  );
}
