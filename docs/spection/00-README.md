# Digitar Pro Academy - Engenharia guiada por SPECTION

- Versão documental: 0.2, 17/11/2026
- Estado: **In Review - pendente de revisão humana e aprovação de release**
- Sistema de referência: MVP 0.5 na branch `main`; redesign 0.6 e correções da FEAT-001 consolidados em `feature/feat-001` e **não devem ser considerados publicados** até merge autorizado.
- Framework: [SPECTION](https://github.com/alexsandsouza/spection), fases Discover, Specify, Architect, Plan, Build, Verify e Release.
- Implementador proposto: Qoder IDE, sob supervisão humana.

## Artefatos

| Fase | Artefato | Estado |
|---|---|---|
| 01 Discover | [Product Brief](01-product-brief.md) | Draft |
| 02 Specify | [PRD](02-prd.md) | Draft |
| 03 Architect | [HLD](03-hld.md), [LLD](04-lld.md), [ADR-0001](adr/ADR-0001-brownfield.md), [ADR-0002](adr/ADR-0002-testes-jsdom.md), [ADR-0003](adr/ADR-0003-integracao-premium-feat-001.md) | Draft/Proposed |
| 04 Plan | [FEAT-001](../../specs/FEAT-001-experiencia-aprendizagem/feature-spec.md), [Tasks](../../specs/FEAT-001-experiencia-aprendizagem/tasks.md) | In Review |
| 05 Build | Qoder seguindo [AGENTS.md](../../AGENTS.md) | Implementado em `feature/feat-001` |
| 06 Verify | [Evidências 2026-11-17](verification/2026-11-17-test-evidence.md) | Automatizado executado; manual pendente |
| 07 Release | Aprovação humana, changelog, rollback e deploy | Pendente |

**Sequência:** revisar documentos, registrar aprovações, usar o prompt em [Qoder](qoder-brief.md), implementar numa branch de feature e abrir PR. Não editar produção sem revisão.

## Hipóteses a validar

1. A interface reduz fricção do primeiro exercício.
2. A progressão pedagógica prioriza precisão, depois velocidade.
3. As métricas atuais são educativas e precisam de fórmula documentada e testes.
4. A persistência local é suficiente para o MVP, mas não para sincronização multi-dispositivo.

## Regras

- Não inventar evidências nem declarar testes aprovados sem executá-los.
- Não criar autenticação, pagamentos, IA ou banco de dados sem decisão de escopo.
- Preservar os resultados atuais de `localStorage` e a funcionalidade de Enter.
- Revisar a PR #1 antes de decidir quais mudanças da v0.6 serão incorporadas; a consolidação atual está em `feature/feat-001`.
- Não fazer merge nem deploy sem autorização explícita do responsável.
