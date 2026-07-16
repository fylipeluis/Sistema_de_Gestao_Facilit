
# FacilitSoluções Financeiras

Sistema de gestão financeira para operação de empréstimos, com controle de clientes, contratos, parcelas, cobranças por mensagens via whatsapp e pagamentos via Pix — incluindo geração automática de cobrança, acompanhamento de status e um painel administrativo com visão consolidada da operação.

> ⚠️ **Projeto em desenvolvimento.** Algumas seções do painel administrativo ainda estão em construção (ver [Roadmap](#roadmap--melhorias-planejadas)). Este README será atualizado conforme o sistema evolui.

---

## 🔗 Acesso

| Ambiente | Link | Observação |
|---|---|---|
| Área do Cliente | `[https://facilitsolucoesfinanceiras.netlify.app/login]` | Login via CPF/CNPJ | Para teste: "369.258.147.00"
| Painel Administrativo | `[https://facilitsolucoesfinanceiras.netlify.app/admin/login]` | Rota de acesso restrito |
| Senha Admin | `` | — |



---

## 📌 Sobre o projeto

O FacilitSoluções nasceu para substituir controle manual/planilha de uma operação de empréstimos por um sistema web completo, cobrindo o ciclo do dinheiro do início ao fim:

- **Cadastro de clientes** e contratos de empréstimo via google forms
- **Geração de cobrança via Pix** (Mercado Pago), com QR Code e link de pagamento
- **Automação de parcelas** — checagem periódica de vencimentos e status de pagamento
- **Lembretes via whatsapp** com mensagens personalizadas para cada cliente com os dados necessarios
- **Painel administrativo** com métricas da operação (total emprestado, cobranças do dia, valores em aberto) e gestão de parcelas
- **Autenticação separada** para clientes (CPF/CNPJ) e administradores (usuário/senha com JWT)

---

## 🛠️ Tecnologias

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- MySQL, hospedado no [Railway](https://railway.app/)
- [APScheduler](https://apscheduler.readthedocs.io/) para automação de tarefas (checagem de parcelas, atualização de status)
- [Mercado Pago API](https://www.mercadopago.com.br/developers) para geração de cobrança Pix
- JWT para autenticação administrativa + bcrypt para hash de senha

**Frontend**
- React + TypeScript, via [Vite](https://vitejs.dev/)
- React Router para navegação
- Deploy contínuo no [Netlify](https://www.netlify.com/)

**Infraestrutura**
- Backend: Railway
- Frontend: Netlify
- Banco de dados: MySQL (Railway)

---

## ✅ Funcionalidades implementadas

- [x] Login de cliente via CPF/CNPJ
- [x] Login administrativo com JWT, rota de acesso não-óbvia
- [x] Cadastro e listagem de clientes e contratos
- [x] Geração de cobrança Pix via Mercado Pago (QR Code + copia e cola)
- [x] Envio de lembretes para pagamentos com mensagens personalizadas
- [x] Automação de verificação de parcelas via APScheduler
- [x] Painel administrativo com cards de métricas (total emprestado, cobranças do dia, valor em aberto)
- [x] Gestão de parcelas e status (pendente, em dia, atrasado)

---

## 🚧 Roadmap / melhorias planejadas

**Interface**
- [ ] Modernização visual do painel administrativo (novo layout com sidebar fixa, tema escuro consolidado)
- [ ] Sidebar com navegação por seção (Dashboard, Clientes, Contratos, Cobranças, Pagamentos, Relatórios)
- [ ] Responsividade mobile do painel admin (sidebar em modo *drawer*)

**Dados e privacidade**
- [ ] Remoção de CPF e telefone da listagem geral de clientes — dados sensíveis passam a não trafegar mais pela API de listagem, ficando acessíveis apenas via consulta direta ao banco quando necessário
- [ ] Revisão de quais colunas aparecem na tabela principal (hoje expõe dado sensível; meta é manter só nome, valor e status na visão geral)

**Funcionalidades**
- [ ] Página de detalhe do cliente separada da listagem
- [ ] Seções de Contratos, Cobranças, Pagamentos e Relatórios com telas próprias (hoje concentradas no Dashboard)
- [ ] Histórico/auditoria de acessos administrativos
- [ ] Possível suporte a mais de um usuário administrador com níveis de permissão distintos
- [ ] Notificações automáticas para clientes próximos do vencimento

**Infraestrutura**
- [ ] Ambiente de homologação separado do de produção
- [ ] Rotina de backup automatizado do banco de dados

---

## 📁 Estrutura geral

```
FacilitSolucoes/
├── backend/          # API FastAPI (Python)
│   ├── routers/
│   ├── schemas/
│   └── ...
└── frontend/         # React + TypeScript (Vite)
    ├── src/
    │   ├── Telas/
    │   ├── components/
    │   └── ...
    └── ...
```

---

## 👤 Autor

Desenvolvido por **Luis Fylipe Pereira de Sousa**.
