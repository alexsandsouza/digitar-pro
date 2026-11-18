# Digitar Pro Academy - Instruções para agentes (SPECTION + Qoder)

Este repositório é um produto existente (**brownfield**), não um projeto novo. Siga o ciclo SPECTION: Discover → Specify → Architect → Plan → Build → Verify → Release.

## Leia antes de editar

1. `docs/spection/00-README.md`
2. `docs/spection/01-product-brief.md`
3. `docs/spection/02-prd.md`
4. `docs/spection/03-hld.md` e `04-lld.md`
5. `docs/spection/adr/ADR-0001-brownfield.md`
6. `specs/FEAT-001-experiencia-aprendizagem/feature-spec.md`
7. `specs/FEAT-001-experiencia-aprendizagem/tasks.md`
8. Código existente `index.html`, `README.md` e PR #1.

## Regras obrigatórias

- Não reescrever do zero, não trocar stack nem adicionar backend sem aprovação.
- Não alterar `main` ou publicar em produção sem autorização explícita.
- Não remover lições, resultados e conquistas já existentes.
- Preservar `localStorage['ad-typing-mvp-v1']` e `localStorage['digitar-pro-typing-mode']`.
- **Treinamento:** conclui quando atinge comprimento do texto (erros afetam precisão).
- **Precisão:** conclui somente quando texto corresponde integralmente.
- **Enter:** avança apenas após conclusão, uma vez; não inserir quebra de linha durante prática.
- Manter 12 lições, quatro módulos e tela de conclusão até nova especificação aprovada.
- Não afirmar métricas ou testes não executados.
- Revisar a branch `feature/premium-v0.6` e a PR #1; evitar sobrescrever correções da `main`.
- Criar mudanças pequenas, rastreáveis com IDs RF/RNF, FEAT, TASK e TEST.
- Evitar segredos, dados pessoais e dependências novas sem justificativa.
- Verificar responsividade, teclado, foco, contraste e movimento reduzido.

## Entrega do agente

Antes de implementar: plano de arquivos/tarefas/impacto e riscos. Depois: diff, testes efetivamente rodados, resultados, pendências e instruções de rollback. Abrir PR para revisão humana.

## Definition of Done

Testes executados e documentados, conformidade com critérios de aceitação, revisão de segurança/privacidade, atualização de documentação e aprovação humana. Sem aprovação humana, a funcionalidade permanece Draft/In Review.
