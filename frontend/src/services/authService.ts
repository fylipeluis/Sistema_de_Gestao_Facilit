const API_URL = import.meta.env.VITE_API_URL;

export async function loginAdmin(
  usuario: string,
  senha: string
): Promise<void> {
    
  const response = await fetch(`${API_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.detail || "Credenciais inválidas");
  }

  const { token } = await response.json();
  localStorage.setItem("admin_token", token);
}

export function logoutAdmin(): void {
  localStorage.removeItem("admin_token");
}

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function isAdminAutenticado(): boolean {
  const token = getAdminToken();
  if (!token) return false;

  // Verifica expiração decodificando o payload do JWT
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}