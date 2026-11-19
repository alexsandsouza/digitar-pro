# ADR-0006 - Hospedagem Neon (PostgreSQL) + Vercel (Node API)

- **Estado:** Accepted
- **Data:** 2026-11-19
- **Feature:** FEAT-003 (operação/produção)
- **Relacionado:** ADR-0001, ADR-0004, LLD Backend

## Contexto

A FEAT-003 exige PostgreSQL + Node.js para contas e RBAC. O site estático no GitHub Pages não executa Node. Firebase Spark não oferece PostgreSQL. É preciso um caminho gratuito (ou freemium) que preserve o código atual (`pg` + `createAppHandler`) sem reescrever a prática nem inventar backend novo.

## Decisão

- **PostgreSQL gerenciado:** [Neon](https://neon.tech) (plano Free), via `DATABASE_URL` com SSL (`sslmode=require`).
- **API + app Node:** [Vercel](https://vercel.com) (Hobby), com entrada serverless em `api/index.js` reutilizando `createAppHandler` / `createPgStore`.
- **Prática:** continua no `index.html` existente; no deploy Vercel, estáticos e `/api/*` ficam no **mesmo domínio** (cookie `SameSite=Lax` sem CORS cruzado).
- **GitHub Pages:** permanece opcional como espelho estático; se apontar para a API na Vercel, configurar `CORS_ORIGIN` (Pages) e `window.DIGITAR_PRO_API_BASE` (URL da Vercel), com cookie `SameSite=None; Secure`.
- **Migrações e seed admin:** executados contra o Neon (localmente com a `DATABASE_URL` de produção ou via script), não exigem alterar o schema FEAT-003.

## Alternativas consideradas

- **Somente GitHub Pages:** não roda Node. Rejeitada.
- **Firebase + Firestore:** mudaria o store e afastaria do ADR-0004. Rejeitada para esta etapa.
- **Railway / Render / Fly.io:** viáveis, porém Neon + Vercel cobrem Postgres + Node no free tier com o menor desvio do código atual.
- **Neon serverless driver (`@neondatabase/serverless`):** possível otimização futura; nesta entrega mantém-se `pg` TCP para não adicionar dependência sem necessidade.

## Consequências

- Cold start serverless e limite de conexões do Neon Free: pool pequeno (`max` baixo em ambiente Vercel/Neon).
- Segredos (`DATABASE_URL`, `ADMIN_*`) só em variáveis de ambiente; nunca no repositório.
- Deploy e merge em produção continuam exigindo autorização humana explícita (AGENTS.md).

## Aprovação

**Accepted** em 19/11/2026 pelo responsável pelo produto nesta sessão: seguir **Neon + Vercel** para hospedar o backend FEAT-003.
