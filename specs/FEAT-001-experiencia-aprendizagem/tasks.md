# FEAT-001 - Tasks e verificação

| ID | Tarefa | Requisito | Critério | Evidência | Status |
|---|---|---|---|---|---|
| TASK-001 | Mapear comportamento do `index.html` e da PR #1 | RF-001 a RF-012 | AC-001 a AC-009 | Análise comparativa | Todo |
| TASK-002 | Criar testes de caracterização de conclusão/Enter | RF-002 a RF-004 | AC-001 a AC-003 | TEST-001 a TEST-004 | Todo |
| TASK-003 | Testar compatibilidade do localStorage | RF-006 | AC-004 | TEST-005 | Todo |
| TASK-004 | Revisar renderização da trilha e conquistas | RF-001, RF-007 | AC-005 | TEST-006 | Todo |
| TASK-005 | Ajustar fluxo UX/UI e responsividade | RF-008, RF-012 | AC-006 | TEST-007 | Todo |
| TASK-006 | Rever dashboard e métricas | RF-005, RF-009 | AC-007 | TEST-008 | Todo |
| TASK-007 | Testar foco e acessibilidade | RNF-002 | AC-008 | TEST-009 | Todo |
| TASK-008 | Atualizar documentação, revisar PR e preparar rollback | RNF-007 | AC-009 | Checklist de release | Todo |

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

**Ainda não executado.** Para cada teste registrar comando ou ação, ambiente, data, resultado, captura/log e commit SHA. Não marcar Verified por avaliação subjetiva.

## Definition of Done

Critérios aceitos + código revisado + testes aplicáveis executados e com evidência + riscos de privacidade avaliados + aprovação humana + plano de rollback.
