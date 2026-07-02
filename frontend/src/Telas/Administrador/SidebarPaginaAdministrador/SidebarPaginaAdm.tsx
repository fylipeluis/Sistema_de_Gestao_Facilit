import {
  LayoutGrid,
  Users,
  FileText,
  CircleDollarSign,
  Wallet,
  TrendingUp,
} from "lucide-react";
import "./SidebarPaginaAdm.css";

export type Secao =
  | "dashboard"
  | "clientes"
  | "contratos"
  | "cobrancas"
  | "pagamentos"
  | "relatorios";

interface NavItem {
  label: string;
  secao: Secao;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", secao: "dashboard", icon: LayoutGrid },
  { label: "Clientes", secao: "clientes", icon: Users },
  { label: "Contratos", secao: "contratos", icon: FileText },
  { label: "Cobranças", secao: "cobrancas", icon: CircleDollarSign },
  { label: "Pagamentos", secao: "pagamentos", icon: Wallet },
  { label: "Relatórios", secao: "relatorios", icon: TrendingUp },
];

interface SidebarProps {
  secaoAtiva: Secao;
  onSelecionar: (secao: Secao) => void;
  userName?: string;
  userRole?: string;
}

export default function Sidebar({
  secaoAtiva,
  onSelecionar,
  userName = "Admin",
  userRole = "Painel Admin",
}: SidebarProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Facility</span>
          <span className="sidebar-brand-role">{userRole}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ label, secao, icon: Icon }) => (
          <button
            key={secao}
            type="button"
            onClick={() => onSelecionar(secao)}
            className={`sidebar-link${
              secao === secaoAtiva ? " sidebar-link-active" : ""
            }`}
          >
            <Icon size={19} strokeWidth={2} className="sidebar-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}