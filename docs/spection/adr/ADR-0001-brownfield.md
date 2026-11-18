# ADR-0001 - Evolução incremental do MVP existente

- **Estado:** Accepted
- **Data:** 2026-11-17
- **Responsável:** equipe do projeto
- **Requisitos:** RF-001 a RF-012; RNF-003, RNF-004, RNF-007

## Contexto

O Digitar Pro já funciona como site estático no GitHub Pages e possui histórico de alunos armazenado no navegador. Há uma PR aberta para redesign 0.6. Uma reescrita completa poderia introduzir regressões e perda de compatibilidade.

## Decisão proposta

Evoluir incrementalmente o aplicativo com especificações SPECTION e mudanças pequenas, rastreáveis e revisadas. Preservar contrato de `localStorage`, interface pedagógica e regras atuais de conclusão. O Qoder atua como implementador supervisionado.

## Alternativas consideradas

- **Reescrever imediatamente com React/TypeScript:** modularidade potencial, porém maior custo e risco de migração no MVP.
- **Manter indefinidamente HTML monolítico:** menor custo imediato, porém difícil testar e manter.
- **Refatoração gradual (proposta):** equilíbrio entre risco, prazo e qualidade; exige testes de caracterização.

## Consequências

- Positivas: menor risco de interrupção e caminho de testes incremental.
- Negativas: coexistência temporária de estrutura legada e componentes novos.
- Revisar após a estabilização do fluxo e planejamento das 60 lições.

## Aprovação

**Accepted** em 17/11/2026, pelo responsável pelo produto nesta sessão. A evolução continua incremental, sem reescrita e sem troca de stack.
