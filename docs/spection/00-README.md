# Digitar Pro Academy - Engenharia guiada por SPECTION

- Versão documental: 0.2, 17/11/2026
- Estado: **Release autorizado em 17/11/2026** pela PR #3. A verificação manual complementar permanece pendente e não foi declarada como concluída.
- Sistema de referência: FEAT-001 e redesign 0.6 em `feature/feat-001`, autorizados para a `main`. O GitHub Pages publica a partir da `main`.
- Framework: [SPECTION](https://github.com/alexsandsouza/spection), fases Discover, Specify, Architect, Plan, Build, Verify e Release.
- Implementador proposto: Qoder IDE, sob supervisão humana.

## Artefatos

| Fase | Artefato | Estado |
|---|---|---|
| 01 Discover | [Product Brief](01-product-brief.md) | Aprovado em 17/11/2026 |
| 02 Specify | [PRD](02-prd.md) | Aprovado em 17/11/2026 |
| 03 Architect | [HLD](03-hld.md), [LLD](04-lld.md), [ADR-0001](adr/ADR-0001-brownfield.md), [ADR-0002](adr/ADR-0002-testes-jsdom.md), [ADR-0003](adr/ADR-0003-integracao-premium-feat-001.md) | Aprovado / Accepted em 17/11/2026 |
| 04 Plan | [FEAT-001](../../specs/FEAT-001-experiencia-aprendizagem/feature-spec.md), [Tasks](../../specs/FEAT-001-experiencia-aprendizagem/tasks.md); [FEAT-004 (Draft)](../../specs/FEAT-004-freemium-certificado/feature-spec.md) | FEAT-001 aprovada em 17/11/2026; FEAT-004 em Draft, bloqueada por decisões D1–D7 |
| 05 Build | Qoder seguindo [AGENTS.md](../../AGENTS.md) | Implementado em `feature/feat-001` |
| 06 Verify | [Evidências 2026-11-17](verification/2026-11-17-test-evidence.md); [roteiro manual 2026-11-21](verification/2026-11-21-feat-001-manual.md) | Evidência automatizada aceita; manual complementar com roteiro aberto |
| 07 Release | [Nota de release](release/2026-11-17.md), rollback e deploy | Autorizado em 17/11/2026 |

**Sequência:** os artefatos deste ciclo foram aprovados em 17/11/2026. As decisões de produto mantêm PPM sem teto, Treinamento com erros, rótulo "Próximo módulo" e escopo sem banco. O release pela PR #3 foi autorizado na mesma data, com a verificação manual ainda pendente.

A [FEAT-002](../../specs/FEAT-002-continuidade-sessao/feature-spec.md) restaura a última lição e mostra o PPM gravado. O release foi autorizado em 17/11/2026. Metas, níveis e ampliação da trilha continuam sem regra aprovada.

O pedido de login, painéis, freemium e certificado está em [Discover 17/11/2026](discovery/2026-11-17-contas-freemium.md). Os módulos 1 e 2 são gratuitos e os módulos 3 e 4 serão pagos. A primeira entrega aprovada em 18/11/2026 é a [FEAT-003](../../specs/FEAT-003-contas-paineis/feature-spec.md): implementada na branch `feature/feat-003` com Node.js + PostgreSQL (`pg`), RBAC estrito, 55 testes passando (`npm test`), [evidências documentadas](verification/2026-11-18-feat-003.md) e [release autorizado](release/2026-11-18-feat-003.md).

A cobrança da prática e o certificado estão especificados em **Draft** na [FEAT-004](../../specs/FEAT-004-freemium-certificado/feature-spec.md) (criada em 21/11/2026). Ela **não está aprovada** e permanece bloqueada por sete decisões em aberto (D1–D7), incluindo provedor de pagamento, preço, moeda e se o progresso passa a ser sincronizado com o servidor. Nenhum valor ou provedor foi presumido.

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
