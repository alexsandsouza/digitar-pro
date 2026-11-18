# ADR-0003 - Integração da prévia 0.6 com as correções da FEAT-001

- **Estado:** Accepted
- **Data:** 2026-11-17
- **Responsável:** equipe do projeto
- **Requisitos:** RF-002 a RF-009, RF-012; RNF-002, RNF-004
- **Feature:** FEAT-001
- **Relacionado:** PR #1 (`feature/premium-v0.6`), ADR-0001, ADR-0002

## Contexto

A PR #1 traz o redesign 0.6 (dashboard, objetivos, teclado recolhível, responsividade), mas mantém defeitos observados também na `main`: resumo de módulo só abre se a última lição do índice for a última concluída, overflow horizontal em telas estreitas, leitura permissiva do `localStorage` e modal sem Escape/foco preso. O pedido é uma única PR consolidada, sem merge ou deploy sem aprovação.

## Decisões

1. **Base visual:** adotar o redesign da PR #1 como ponto de partida, preservando as 12 lições, os textos, as chaves de armazenamento e os kernels de conclusão.
2. **Resumo por transição:** disparar o resumo quando o módulo passa de incompleto para completo, não quando a lição concluída é a última do índice. Repetir lição de módulo completo não reabre o modal.
3. **Enter:** manter o handler global e o avanço de exatamente uma lição. Ignorar repetição, IME e modificadores. Com o resumo aberto, Enter avança; Escape fecha e devolve foco.
4. **Responsividade:** trocar o grid para `minmax(0, 1fr)` e aplicar `min-width: 0` aos filhos, permitindo rolagem interna da trilha e do teclado sem overflow da página.
5. **Persistência:** aceitar apenas objeto não nulo e não array no topo do JSON; manter o valor inválido no storage e continuar com progresso vazio. Registros sem `last` contam como concluídos na trilha, mas não geram médias ou conquistas.
6. **Métricas:** preservar as fórmulas existentes (PPM e precisão), documentá-las no PRD e cobri-las com relógio controlado. Não há teto de PPM nesta entrega; colagem continua como risco registrado.
7. **Dashboard:** rotular a média de precisão como "Média por lição" e proteger exibições com `Number.isFinite`.
8. **Acessibilidade do modal:** `role="dialog"`/`aria-modal`, foco inicial em "Continuar", foco preso por Tab/Shift+Tab, Escape, `inert` no conteúdo de fundo e bloqueio de rolagem com `body.modal-open`.

## Alternativas consideradas

- **Manter o gatilho antigo do resumo e exigir conclusão em ordem:** contraria RF-007 e a liberdade de navegação da trilha.
- **Fazer Enter saltar para o primeiro módulo incompleto:** mudaria a regra de avanço de uma lição e poderia pular conteúdo já existente.
- **Ignorar a PR #1 e reaplicar o redesign do zero:** risco de perder ajustes e duplicar histórico; rejeitado pela ADR-0001.

## Consequências

- Positivas: comportamento consistente em conclusão fora de ordem, página sem overflow em 360/632/768/1280 px, modal operável por teclado e progresso legado preservado.
- Negativas aceitas em 17/11/2026: o rótulo "Próximo módulo" permanece, mesmo quando a conclusão ocorre fora de ordem, e o PPM permanece sem teto, inflável por colagem. Nenhuma correção de destino ou de fórmula nesta entrega.
- Riscos: alterações de CSS e de estado compartilhado podem afetar a trilha; mitigado por testes automatizados e medições de viewport no navegador.

## Aprovação

**Accepted** em 17/11/2026, pelo responsável pelo produto nesta sessão. As oito decisões desta ADR valem para a FEAT-001. Na mesma data, a decisão de produto manteve o rótulo "Próximo módulo", a fórmula de PPM sem teto, a conclusão do Treinamento com erros e a ausência de banco. O release pela PR #3 foi autorizado em seguida, com a verificação manual ainda pendente.
