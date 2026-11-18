# FEAT-001 - Tasks e verificação

| ID | Tarefa | Requisito | Critério | Evidência | Status |
|---|---|---|---|---|---|
| TASK-001 | Mapear comportamento do `index.html` e da PR #1 | RF-001 a RF-012 | AC-001 a AC-009 | [Caracterização 2026-11-17](../../docs/spection/discovery/characterization-2026-11-17.md) | Done (revisão pendente) |
| TASK-002 | Criar testes de caracterização de conclusão/Enter | RF-002 a RF-004 | AC-001 a AC-003 | TEST-001 a TEST-004 em `tests/modes-enter.test.js` (18 pass) | Done |
| TASK-003 | Testar compatibilidade do localStorage | RF-006 | AC-004 | TEST-005 em `tests/storage.test.js` (10 pass) | Done |
| TASK-004 | Revisar renderização da trilha e conquistas | RF-001, RF-007 | AC-005 | TEST-006 em `tests/modes-enter.test.js`; resumo por transição | Done |
| TASK-005 | Ajustar fluxo UX/UI e responsividade | RF-008, RF-012 | AC-006 | TEST-007 no navegador; sem overflow em 360/632/768/1280 px | Done (verificação manual pendente) |
| TASK-006 | Rever dashboard e métricas | RF-005, RF-009 | AC-007 | TEST-008 em `tests/dashboard-metrics.test.js` (8 pass); fórmulas no PRD | Done |
| TASK-007 | Testar foco e acessibilidade | RNF-002 | AC-008 | TEST-009 em `tests/a11y.test.js` (8 pass); Escape/Tab/inert no navegador | Done |
| TASK-008 | Atualizar documentação, revisar PR e preparar rollback | RNF-007 | AC-009 | README, PRD, LLD, ADR-0002/0003, evidências e rollback; PR aberta | In Review |

## Casos de teste prioritários

- **TEST-001:** Treinamento sem erros finaliza e Enter avança.
- **TEST-002:** Treinamento com um erro finaliza e Enter avança, registrando precisão inferior a 100%.
- **TEST-003:** Precisão com erro não finaliza; corrigindo exatamente, finaliza e Enter avança.
- **TEST-004:** Enter prematuro, repetido, em modal e após troca de modo não pula lições.
- **TEST-005:** carregar fixture legada de progresso, atualizar tela e recarregar sem perder dados.
- **TEST-006:** concluir módulo, validar título, medalha e agregação das métricas.
- **TEST-007:** rolagem/trilha em diferentes viewports, inclusive modal de conquista.
- **TEST-008:** medir fórmulas de PPM, precisão e duração com entradas conhecidas.
- **TEST-009:** teclado, foco, contraste, texto alternativo e movimento reduzido.

## Log de execução

- **Data:** 2026-11-17
- **Commit do código verificado:** `d77e7af` na branch `feature/feat-001`
- **Ambiente:** Windows 10.0.26300 x64; Node.js v24.20.0; npm 11.19.0; jsdom 31.0.1 (dev-only)
- **Comando:** `npm test` (`node --test "tests/*.test.js"`)
- **Resultado:** 45 testes, 45 pass, 0 fail, 0 skipped, duração 4056.9 ms
- **Navegador:** fluxos Treinamento/Precisão/Enter, resumo fora de ordem, Escape/Tab/inert e viewports 360/632/768/1280 px verificados em `http://localhost:8123`; console sem erros
- **Evidência completa:** [verification/2026-11-17-test-evidence.md](../../docs/spection/verification/2026-11-17-test-evidence.md)
- **Ainda pendente:** screenshot, teclado físico, leitor de tela, Firefox/Safari, teste de usabilidade e aprovação humana. Não marcar Verified sem essas etapas.

## Definition of Done

Critérios aceitos + código revisado + testes aplicáveis executados e com evidência + riscos de privacidade avaliados + aprovação humana + plano de rollback.
