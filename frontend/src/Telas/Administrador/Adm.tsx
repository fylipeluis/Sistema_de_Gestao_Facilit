import HeaderPaginaAdministrador from "./HeaderPaginaAdministrador/Header";
import { ResumoSectionAdm } from "./ResumoDetalhesAdm/ResumoDetalhesAdm";
import TabelaClientes from "./TabelaClientePaginaAdministrador/TabelaClientes";
import { useClientes } from "../../hooks/useClientes";
import { useFaturas } from "../../hooks/useFaturas";

export default function PaginaAdministrador() {
  const { clientes } = useClientes();
  const { faturas } = useFaturas(clientes);

  return (
    <>
      <HeaderPaginaAdministrador />
      <ResumoSectionAdm faturas={faturas} />
      <TabelaClientes />
    </>
  );
}
