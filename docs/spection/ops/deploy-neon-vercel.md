# Deploy FEAT-003 — Neon (PostgreSQL) + Vercel

Relacionado: [ADR-0006](../adr/ADR-0006-neon-vercel.md). Não publica em produção sem autorização explícita.

## 1. Neon (banco)

1. Crie conta/projeto em [console.neon.tech](https://console.neon.tech).
2. Copie a connection string **com** `?sslmode=require` (role que possa criar tabelas).
3. No seu `.env` local (não versionado):

```env
DATABASE_URL=postgres://...@...neon.tech/neondb?sslmode=require
ADMIN_NAME=Administrador Digitar Pro
ADMIN_EMAIL=seu-admin@exemplo.com
ADMIN_PASSWORD=senha-forte-aqui
```

4. Aplique schema e admin:

```powershell
npm run migrate
npm run seed:admin
```

5. Smoke local contra o Neon (opcional):

```powershell
$env:DATABASE_URL="postgres://...neon.tech/neondb?sslmode=require"
npm start
# GET http://localhost:3000/api/health → { "ok": true, "database": "postgresql" }
```

## 2. Vercel (API + app)

1. Importe o repositório Digitar-Pro no [dashboard Vercel](https://vercel.com) (Hobby).
2. Framework Preset: **Other**. Build Command vazio (ou deixe o padrão sem build). Output: raiz do repo.
3. Variáveis de ambiente (Production / Preview):

| Nome | Valor |
|---|---|
| `DATABASE_URL` | connection string Neon com `sslmode=require` |
| `NODE_ENV` | `production` (a Vercel já define; confirme) |
| `CORS_ORIGIN` | *vazio* se o front for o próprio domínio Vercel |
| `RUN_MIGRATIONS_ON_BOOT` | `true` (opcional; padrão já migra na Vercel) |

4. Deploy da branch autorizada (ex.: `feature/deploy-neon-vercel` ou `main` após merge).
5. Verifique: `https://SEU-PROJETO.vercel.app/api/health`
6. Abra o app no mesmo domínio, cadastre um aluno e entre com o admin seedado.

### CLI (alternativa)

```powershell
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
npx vercel --prod
```

Só use `--prod` com autorização explícita.

## 3. GitHub Pages + API Vercel (opcional)

Mesmo domínio é preferível. Se o Pages continuar como front:

1. Na Vercel: `CORS_ORIGIN=https://SEU_USER.github.io` (ou o origin exato do Pages).
2. No Pages, antes do script da prática:

```html
<script>window.DIGITAR_PRO_API_BASE='https://SEU-PROJETO.vercel.app';</script>
```

Cookie passa a `SameSite=None; Secure` automaticamente quando `CORS_ORIGIN` está definido.

## 4. Rollback

- Vercel: Instant Rollback do deployment anterior no dashboard.
- Neon: não há migrate down automático; restore de branch/ponto Neon se necessário.
- Código: reverter o merge da branch de deploy; Pages estático permanece independente.

## 5. Checklist de aceite operacional

Verificado em 21/11/2026 no Preview `digitar-d1d6j1y83-alexsanders-projects-5ac6855b.vercel.app` (branch `feature/deploy-neon-vercel`, commit `8750663`) via `vercel curl`; banco Neon de produção compartilhado entre Preview e Production.

- [x] `/api/health` retorna `ok: true` no domínio Vercel (`{"ok":true,"database":"postgresql"}`)
- [x] Cadastro de aluno e login funcionam no mesmo domínio (POST `/api/auth/register` → 201 + sessão; POST `/api/auth/login` → 200; `GET /api/me` → 200)
- [x] Admin seedado acessa painel e lista de usuários (`npm run seed:admin` executado em 21/11/2026 — estava pendente no banco; login admin → 200; `GET /api/admin/users` e `/api/admin/overview` → 200, sem hash de senha; aluno recebe 403 na rota admin)
- [x] `localStorage` da prática intacto (`ad-typing-mvp-v1`, `digitar-pro-typing-mode`, `digitar-pro-current-lesson` e `digitar-pro-show-hands` presentes no HTML servido; comportamento coberto pelos testes jsdom, 60/60)
- [x] Nenhum segredo commitado (`.env` nunca entrou no histórico; somente placeholders em `.env.example` e nos testes)

Observações do aceite:

- A conta de aluno criada para o teste foi removida pelo próprio fluxo LGPD (`DELETE /api/me` → 200; sessão invalidada com 401 em seguida), sem resíduos no banco.
- O domínio de produção `digitar-pro.vercel.app` ainda serve o deployment de 19/11/2026; promoção para produção exige autorização explícita (ver seção 4, Rollback).
