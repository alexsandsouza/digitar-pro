# LLD Backend - FEAT-003 (Contas, RBAC e PostgreSQL)

- **Status:** Aprovado em 18/11/2026 (runtime Node.js + PostgreSQL definidos; aguarda apenas aprovação do plano de arquivos antes do código)
- **Relacionado:** [ADR-0004](adr/ADR-0004-backend-contas.md), [FEAT-003](../../specs/FEAT-003-contas-paineis/feature-spec.md)

## 1. Modelo de papéis e controle de acesso (RBAC)

| Papel | Criação | O que pode acessar | O que é bloqueado (`403 Forbidden`) |
|---|---|---|---|
| `student` | Auto-cadastro público (`POST /api/auth/register`) ou pelo sistema | Próprio perfil (`/api/me`), próprio progresso futuro, painel do aluno | Lista de outros alunos, faturamento, métricas administrativas (`/api/admin/*`) |
| `admin` | Seed inicial / CLI / variável de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`) | Painel administrativo, lista de contas (sem hash), indicadores administrativos e faturamento futuro (`/api/admin/*`) | — |

Regra de segurança:
- O payload de cadastro público **ignora** qualquer campo `role`; contas criadas via registro público nascem sempre como `student`.
- Toda rota `/api/admin/*` valida sessão autenticada + `role === 'admin'` no servidor (nunca confiar apenas em ocultação no frontend).

## 2. Esquema inicial PostgreSQL

```sql
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
```

Nota: tabelas de pagamento, assinaturas/módulos liberados e certificados ficam reservadas para a feature seguinte (com preços e provedor definidos).

## 3. Contratos mínimos de API

| Método e Rota | Acesso | Função |
|---|---|---|
| `GET /api/health` | Público | Verifica disponibilidade da API e conexão com PostgreSQL |
| `POST /api/auth/register` | Público | Cria conta `student`, gera hash da senha (`scrypt`/`argon2id`) e abre sessão |
| `POST /api/auth/login` | Público | Autentica por e-mail/senha, emite cookie `HttpOnly`/`SameSite` ou token de sessão |
| `POST /api/auth/logout` | Autenticado | Revoga a sessão atual sem tocar no `localStorage` da prática |
| `GET /api/me` | Autenticado | Retorna `{ id, name, email, role, created_at }` do usuário logado (nunca `password_hash`) |
| `DELETE /api/me` | `student` | Solicita/executa exclusão ou anonimização da própria conta (LGPD) |
| `GET /api/admin/users` | `admin` | Lista contas `{ id, name, email, role, status, created_at }` para o painel admin |
| `GET /api/admin/overview` | `admin` | Resumo administrativo (contagem de contas; faturamento previsto para entrega futura) |

## 4. Privacidade e retenção (LGPD)

- **Dados coletados:** nome, e-mail, papel (`student`/`admin`), hash da senha (`scrypt`), data de criação e sessão.
- **Proibição:** nunca armazenar ou retornar `password_hash` em respostas JSON; nunca armazenar dados de cartão no Digitar Pro.
- **Exclusão:** o aluno pode encerrar a própria conta (`DELETE /api/me`), removendo sessões e apagando/anonimizando nome e e-mail (mantendo integridade caso haja registros fiscais futuros em entregas pagas).

## 5. Decisões aprovadas em 18/11/2026

1. **Runtime da API:** Node.js (`http` nativo + pacote `pg`, usando `node:crypto` `scrypt` para hash de senhas e tokens aleatórios para sessões).
2. **Banco de dados:** PostgreSQL conectado via `DATABASE_URL` (local/Docker em desenvolvimento, gerenciado em produção).
3. **Dependência mínima:** apenas `pg` para o servidor; nenhum framework pesado desnecessário.
4. **Testabilidade:** a camada de repositório aceita pool `pg` injetável, permitindo testar RBAC, login, cadastro, logout e exclusão sem depender de banco externo no `npm test`, além de testes de integração reais quando `DATABASE_URL` estiver configurada.
