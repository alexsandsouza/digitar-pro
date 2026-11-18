# Caracterização do MVP e da PR #1 - 2026-11-17

- **Estado:** Levantamento executado; conclusões pendentes de revisão humana.
- **Base:** `main` em `2ab3cc6`; PR #1 em `ac7d17f`; documentos em `docs/spection-qoder-v0.7`.
- **Escopo:** comportamento real de Treinamento, Precisão, Enter, métricas, dashboard, conquista e `localStorage`.
- **Método:** leitura do código, servidor estático local e navegador integrado (Chromium). Eventos de teclado foram disparados no DOM porque a surface do navegador estava oculta; clique, screenshot e teclado físico não puderam ser usados.

## 1. Kernel funcional

| Área | Comportamento observado | Referência |
|---|---|---|
| Lições | 12 lições fixas em 4 módulos; textos e objetivos no próprio HTML | `index.html:112` (main), `index.html:149` (PR) |
| Treinamento | Conclui ao atingir o comprimento, com ou sem erros; erros entram na precisão | `index.html` `complete` / `input` |
| Precisão | Só conclui com igualdade exata; ao atingir o comprimento com erro, avisa | `index.html` `input` |
| Enter | Ignora repetição, IME e modificadores; avança uma única vez após conclusão; bloqueia quebra de linha | `index.html:213` (main), `index.html:263` (PR) |
| Métricas | `PPM = round((corretos / 5) / (segundos / 60))`; precisão = `round((digitados - erros) / digitados * 100)`; tempo inclui pausas | `index.html` `getMetrics` |
| Registro | `{ wpm: melhor, accuracy: última, last: { wpm, accuracy, seconds } }` | `index.html` `complete` |
| Dashboard (PR) | Derivado do histórico: lições, máximo PPM, média das últimas precisões por lição, módulos completos | PR `updateDashboard` |
| Conquista | Resumo e medalha por módulo; só abre na conclusão da última lição do índice do módulo | PR `complete` / `showSummary` |
| Storage | `ad-typing-mvp-v1` e `digitar-pro-typing-mode`; JSON inválido não derruba a página | `index.html:127` |

## 2. Comportamentos verificados

| Cenário | Resultado real |
|---|---|
| Treinamento com 1 erro em 29 caracteres | Concluiu; precisão 97%; registro salvo; Enter avançou 1 lição |
| Enter prematuro com textarea focado | Sem avanço e sem quebra de linha |
| Precisão com erro no último caractere | Não concluiu; Enter exibiu aviso; correção exata concluiu a 100%; Enter avançou 1 lição |
| Troca de modo no meio da tentativa | Tentativa limpa; lição e histórico preservados |
| Botão "Próxima lição" sem concluir | Avançou mesmo assim (navegação livre existente) |
| Fixture legada + recarga | Registros reapareceram; chaves mantidas |
| JSON corrompido + recarga | App iniciou em 0/12 sem crash; string inválida permaneceu no storage |
| Módulo completo em ordem | Resumo e conquista exibidos; Enter levou ao próximo módulo |
| Módulo completo fora de ordem | 3/12 exibidos, mas resumo/conquista não apareceram |
| Layout em viewport de 632 px | `document.scrollWidth` de 2754 px na main e 2762 px na PR |

> Os valores de PPM das execuções automatizadas não representam uso humano: o preenchimento instantâneo do textarea produz PPM irreal. Os testes automatizados usarão relógio controlado.

## 3. Achados e riscos

1. **Resumo fora de ordem (RF-007):** o resumo só é tentado quando a lição concluída é a última do índice do módulo. Se o aluno concluir as três lições em outra ordem, o módulo fica 3/3 sem resumo e sem conquista.
2. **Overflow horizontal (RF-012/AC-006):** a trilha horizontal em telas estreitas expande o grid em vez de rolar internamente. Presente na main e na PR.
3. **Modal sem Escape/foco preso (RNF-002/AC-008):** o foco inicial vai para "Continuar", mas Tab alcança o fundo e Escape não fecha.
4. **Leitura de progresso:** JSON válido com tipo inesperado (array/string) não é rejeitado; uma string de 12 caracteres pode marcar 12 lições como concluídas.
5. **Métricas:** `wpm` guarda o melhor resultado e `accuracy` a última tentativa; o resumo usa `last`. A fórmula precisa ser documentada e testada.
6. **PPM sem limite:** colar o texto infla a velocidade. Fora do escopo desta feature; registrar como risco de integridade dos dados.
7. **README da PR #1:** a linha do histórico 0.6 contém `\n` literal, quebrando a tabela Markdown.
8. **Integração:** a main e a PR #1 têm commits equivalentes com hashes diferentes; o merge exigiu resolução manual em `README.md` e `index.html`.

## 4. Matriz requisito -> teste

| Requisito | Critério | Teste |
|---|---|---|
| RF-002 | AC-001 | Treinamento com erro conclui |
| RF-003 | AC-002 | Precisão bloqueia até correção exata |
| RF-004 | AC-003 | Enter prematuro/repetido/modal |
| RF-006 | AC-004 | Fixture legada + recarga |
| RF-007 | AC-005 | Resumo em ordem e fora de ordem |
| RF-008, RF-012 | AC-006 | Viewports 360, 632, 768 e desktop |
| RF-009 | AC-007 | Dashboard derivado |
| RNF-002 | AC-008 | Tab, Escape, foco e contraste |
| RNF-007 | AC-009 | PR, rollback e aprovação |

Testes propostos: TEST-001 a TEST-009 em `specs/FEAT-001-experiencia-aprendizagem/tasks.md`, complementados por testes de fórmula, dashboard, reinício e tipos inválidos de storage.

## 5. Evidências

- Data: 2026-11-17.
- Servidores locais: `http://localhost:8123` (main) e `http://localhost:8124` (PR #1).
- Checagem estática: scripts inline compilam; 32 IDs na main e 37 na PR, sem duplicados ou referências ausentes.
- Execuções de fluxo via navegador integrado com eventos DOM; logs transcritos na seção 2.
- Pendente: screenshot, teclado físico, 360/768 px, leitor de tela, Firefox e Safari.
