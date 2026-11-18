# ADR-0002 - Testes de caracterização e regressão com jsdom

- **Estado:** Proposed
- **Data:** 2026-11-17
- **Responsável:** equipe do projeto
- **Requisitos:** RF-001 a RF-012; RNF-001, RNF-004, RNF-007
- **Feature:** FEAT-001 / TASK-002, TASK-003

## Contexto

O app é um único `index.html` estático, sem build e sem backend. Antes de corrigir fluxos, era necessário congelar o comportamento dos modos Treinamento/Precisão, Enter, métricas, dashboard, conquista e persistência. Testes apenas manuais não são repetíveis nem rastreáveis, e a surface de navegador disponível no ambiente ocultava clique, teclado físico e screenshot.

## Decisão

Adotar `node:test` com **jsdom 31.0.1 como dependência somente de desenvolvimento**. A suíte carrega o `index.html` real com `runScripts: 'dangerously'`, relógio fixo, temporizadores substituídos e `localStorage` pré-semeado. Os testes ficam em `tests/*.test.js` e rodam com `npm test`.

O jsdom **não** é incluído na aplicação publicada: não há bundler, dependência de runtime nem alteração no GitHub Pages.

## Alternativas consideradas

- **Playwright/Cypress:** cobrem layout e teclado reais, porém exigem download de navegadores, build de teste e infraestrutura maior do que o MVP justifica neste momento.
- **Somente testes manuais:** baixo custo inicial, mas sem repetibilidade, cobertura de borda ou evidência objetiva.
- **Extrair lógica para módulos e testar em Node puro:** reduziria o acoplamento ao DOM, mas exigiria refatoração estrutural antes de existir rede de segurança — ordem contrária à ADR-0001.

## Consequências

- Positivas: 45 testes determinísticos, rápidos e executáveis offline; nenhum impacto no artefato publicado; regressões de fluxo detectadas antes de mudanças funcionais.
- Negativas: jsdom não calcula layout real, não simula teclado físico nem implementa todos os comportamentos de foco/`inert`; essas verificações exigem navegador.
- Mitigação: cenários de viewport, modal e teclado foram medidos no navegador integrado e registrados em `docs/spection/verification/2026-11-17-test-evidence.md`.

## Aprovação

**Pendente.** Manter como Proposed até revisão humana da PR.
