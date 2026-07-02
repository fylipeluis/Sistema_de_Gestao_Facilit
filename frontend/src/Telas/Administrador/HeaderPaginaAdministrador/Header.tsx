import "./Header.css";
import { TituloHeaderPaginaAdm } from "./HeaderComponents/TituloHeaderPaginaAdm";


export default function HeaderPaginaAdministrador(){
  return (
    <div className="header">
      <TituloHeaderPaginaAdm />
    </div>
  );
}
