# Evidências de verificação - 2026-11-17

- **Branch:** `feature/feat-001`
- **Código verificado:** commit `d77e7af` (testes e correções da FEAT-001)
- **Ambiente:** Windows 10.0.26300 x64; Node.js v24.20.0; npm 11.19.0; jsdom 31.0.1 (dev-only)
- **Estado:** testes automatizados e verificação de navegador executados; aprovação humana de release pendente.

## 1. Suíte automatizada

Comando:

```bash
npm install
npm test   # node --test "tests/*.test.js"
```

Resultado real (2026-11-17):

```text
tests 45
suites 0
pass 45
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 4056.9
```

Distribuição dos 45 testes:

| Arquivo | Testes | Cobertura |
|---|---:|---|
| `tests/smoke.test.js` | 1 | Carga do `index.html` real, lição inicial e indicadores |
| `tests/modes-enter.test.js` | 18 | TEST-001 a TEST-004, fórmulas, resumo em ordem/fora de ordem, replay |
| `tests/storage.test.js` | 10 | TEST-005, fixture legada, JSON inválido, tipos inesperados, preferência de modo |
| `tests/dashboard-metrics.test.js` | 8 | TEST-006 e TEST-008, dashboard derivado e proteção contra números inválidos |
| `tests/a11y.test.js` | 8 | TEST-009, semântica do diálogo, Escape, foco preso, `inert`, CSS |

Casos prioritários cobertos:

| Teste | Cenário | Resultado |
|---|---|---|
| TEST-001 | Treinamento sem erros conclui e Enter avança | Pass |
| TEST-002 | Treinamento com erro conclui e registra precisão < 100% | Pass |
| TEST-003 | Precisão não conclui com erro e conclui após correção exata | Pass |
| TEST-004 | Enter prematuro/repetido/modificador/troca de modo não pula lição | Pass |
| TEST-005 | Fixture legada carrega, atualiza e persiste após recarga | Pass |
| TEST-006 | Módulo completo em ordem e fora de ordem abre resumo; replay não reabre | Pass |
| TEST-008 | Fórmulas de PPM, precisão e duração com relógio controlado | Pass |
| TEST-009 | Tab, Shift+Tab, Escape, foco inicial/retorno e atributos do modal | Pass |

Observação: TEST-007 (responsividade) foi executado no navegador, não em jsdom, porque o jsdom não calcula layout. Ver seção 3.

## 2. Checagens estáticas

Comando (Node, sem dependências):

```bash
node -e "... compilar scripts inline, contar IDs e referências ..."
```

Resultado:

```text
scripts inline: 1 compilam: true
ids: 37 duplicados: nenhum
refs $(id): 36 ausentes: nenhuma
```

## 3. Verificação de navegador

Servidor estático local em `http://localhost:8123` servindo a branch `feature/feat-001`. A surface do navegador integrado estava oculta (`visibilityState=hidden`), portanto clique, screenshot e teclado físico não estavam disponíveis. Os fluxos foram exercitados com eventos DOM reais (`input`, `change`, `KeyboardEvent`) e medições no documento; a limitação está registrada ao final.

| Cenário | Resultado observado | Requisito |
|---|---|---|
| Treinamento com 1 erro em texto completo | Concluiu desabilitando o textarea; precisão 97%; dashboard `1 / 12` e `97%`; Enter avançou para a lição 1 | RF-002, RF-004, RF-009 |
| Precisão com texto completo contendo erro | Não concluiu (`disabled=false`); mensagem "Você chegou ao fim, mas há erros..."; precisão 97% | RF-003 |
| Precisão após correção exata | Concluiu a 100%, persistiu `{"0":{...,"accuracy":100,...}}` e marcou `1 / 12` | RF-003, RF-006 |
| Módulo concluído fora de ordem (índices 2 -> 0 -> 1) | Índices 2 e 0 não abriram resumo; índice 1 abriu "MÓDULO 1 CONCLUÍDO", `inert=true`, foco em `continueModule`, conquista "Primeiros Passos" | RF-007 |
| Tab no resumo | Foco `continueModule` -> Tab -> `repeatModule`; Shift+Tab -> `continueModule` | RNF-002 |
| Escape no resumo | Fechou, removeu `inert` e `body.modal-open`, devolveu foco a `nextLesson` | RNF-002 |
| Enter após fechar o resumo | Avançou exatamente uma lição (índice 1 -> 2), sem pular duas | RF-004 |
| Larguras 360/632/768/1280 px | `scrollWidth == clientWidth` em todas; sem overflow horizontal; layout em duas colunas apenas em 1280 px | RF-012, AC-006 |
| Modal em iframe 360x640 | Cartão de 20 a 340 px na horizontal e 26 a 614 px na vertical; cabe na viewport; sem overflow; sem rolagem no modal | RF-012, AC-006 |
| Console do navegador | Nenhuma mensagem de erro | RNF-006 |

Medições de layout (iframes same-origin):

```text
360 px  -> clientWidth 345, scrollWidth 345, 1 coluna
632 px  -> clientWidth 617, scrollWidth 617, 1 coluna
768 px  -> clientWidth 753, scrollWidth 753, 1 coluna
1280 px -> clientWidth 1265, scrollWidth 1265, 2 colunas (270px + 919.8px)
```

Nota sobre PPM: o preenchimento sintético instantâneo do textarea produz valores irreais (por exemplo, 174000 PPM). Esses números **não** representam uso humano e não foram usados como evidência de desempenho; os testes de fórmula usam relógio controlado.

## 4. Limitações desta verificação

- Sem screenshot, teclado físico, leitor de tela, Firefox ou Safari.
- Sem teste de usabilidade com pessoas.
- jsdom não valida layout, contraste renderizado nem comportamento nativo completo de foco/`inert`.
- Colagem de texto infla o PPM; risco conhecido e fora do escopo desta entrega.
- O rótulo "Próximo módulo" do resumo não corresponde a um salto de módulo quando a conclusão ocorre fora de ordem.

## 5. Rollback

O trabalho está isolado na branch `feature/feat-001` e em PR aberta para revisão. Para reverter antes do merge, fechar a PR e manter a `main` intacta. Após um eventual merge, reverter o commit de merge ou a sequência `d77e7af` e anteriores da feature restaura o estado anterior sem tocar nos dados dos alunos, que permanecem no `localStorage` do navegador sob as mesmas chaves.
