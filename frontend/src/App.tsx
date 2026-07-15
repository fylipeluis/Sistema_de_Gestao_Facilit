import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import PaginaAdministrador from "./Telas/Administrador/Adm";
import { PaginaDeLogin } from "./Telas/Login/PaginaDeLogin";
import { AdminLogin } from "./Telas/Login/AdmLogin/AdminLogin";
import { DetalhesCliente } from "./Telas/DetalhesCliente/DetalhesCliente";
import { AdminRoute } from "./components/AdminRoute";
import { PaginaPagamento } from "./Telas/PaginaPagamento/PaginaPagamento";

// dentro do <Routes>:


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<PaginaDeLogin />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/administrador"
          element={
            <AdminRoute>
              <PaginaAdministrador />
            </AdminRoute>
          }
        />

        <Route path="/cliente" element={<DetalhesCliente />} />
        <Route path="/pagar/:idCobranca" element={<PaginaPagamento />} />
      </Routes>
    </BrowserRouter>
  );
}