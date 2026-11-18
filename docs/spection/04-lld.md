# LLD - Lógica de digitação, persistência e interface

**Status:** Implementação em revisão (2026-11-17) | **Relacionado:** RF-001 a RF-012

## Funções reais em `index.html`

| Função | Papel |
|---|---|
| `load(i)` | Fecha o resumo, reinicia tentativa, atualiza lição, modo, mensagem, melhor PPM e renderização |
| `getMetrics()` | Calcula erros, precisão, segundos e PPM a partir do textarea |
| `render()` | Pinta caractere correto/errado/próximo, indicadores, barra e tecla alvo |
| `complete()` | Registra melhor PPM e última tentativa, atualiza dashboard e decide se abre o resumo |
| `advance()` | Avança exatamente uma lição (`(current + 1) % total`) e foca o textarea |
| `isModuleComplete(m)` | Verdadeiro quando todas as lições do módulo têm `last` |
| `getModuleStats(m)` | Médias de PPM/precisão e soma de tempo; `null` se incompleto ou não finito |
| `showSummary(m)` / `hideSummary()` | Abre/fecha o resumo, com foco, `inert` e bloqueio de rolagem |
| `updateDashboard()` | Deriva lições concluídas, melhor PPM, média de precisão e conquistas |
| `drawLessons()` | Renderiza a trilha escapando títulos e exibindo melhor PPM |
| `save()` | Serializa `progress` em `localStorage`, ignorando falhas |

O código permanece em um único `index.html`, sem build e sem dependências de runtime.

## Transição do resumo

```text
complete():
  wasComplete = isModuleComplete(módulo)
  progress[i] = { wpm: max(anterior, tentativa), accuracy: tentativa,
                  last: { wpm, accuracy, seconds } }
  save(); drawLessons(); render()
  nowComplete = isModuleComplete(módulo)
  if !wasComplete && nowComplete: showSummary(módulo)
```

A transição incompleto -> completo garante a conquista mesmo quando a última lição concluída não é a última do índice. Repetir uma lição de módulo já completo mantém `wasComplete = true` e não reabre o modal.

## Estrutura de dados existente (não migrar sem testes)

```json
{
  "0": {
    "wpm": 47,
    "accuracy": 98,
    "last": { "wpm": 47, "accuracy": 98, "seconds": 24.4 }
  }
}
```

A estrutura acima é **exemplo ilustrativo**, não um registro real. Chave atual: `ad-typing-mvp-v1`. Preferência: `digitar-pro-typing-mode`. Manter compatibilidade e tratar JSON inválido sem crash.

Na carga, o valor só é aceito se o JSON for um objeto não nulo e não array; caso contrário, `progress` permanece vazio sem sobrescrever o valor armazenado:

```js
let progress = {};
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) progress = stored;
} catch (_) {}
```

Registros sem `last` continuam contando como lição concluída na trilha, mas não entram nas médias nem liberam conquistas. Leituras de PPM/precisão usam `Number.isFinite` antes de exibir.

## Pseudocódigo central

```text
onInput:
  text = lesson.expected
  raw = textarea.value.slice(0, text.length)
  metrics = calculate(raw, text, elapsed)
  if mode == training and raw.length == text.length: complete(metrics)
  else if mode == precision and raw == text: complete(metrics)
  else: render feedback

onEnter:
  if summaryOpen and Escape: close summary and focus "Próxima lição"
  if summaryOpen and Tab: trap focus between resumo buttons
  if modal open: advance exactly one lesson
  else if completed: advance once
  else: prevent newline in textarea; remain
```

O handler global ignora `event.repeat`, `isComposing` e modificadores (Alt/Ctrl/Meta). Quando o Enter é tratado, `preventDefault` evita que um botão focado dispare uma segunda ação.

## UI e acessibilidade

- Trilha acessível por Tab e seleção sem foco perdido.
- Input com rótulo, instrução breve e estado de erro.
- Modal com `role="dialog"`, `aria-modal="true"` e rótulo; foco inicial em "Continuar"; Tab/Shift+Tab presos aos botões do cartão; Escape fecha e devolve foco a "Próxima lição"; fundo com `inert` e `body.modal-open` bloqueando rolagem.
- Scroll natural para desktop; em telas estreitas a trilha e o teclado rolam internamente. O grid usa `minmax(0, 1fr)` e `min-width: 0` para não expandir a página.
- `prefers-reduced-motion` para animações.
- Usar `textContent` ou escape ao renderizar dados; não confiar em texto importado.
- Indicadores com nomes textuais, não apenas cor.

## Tratamento de falhas

- `localStorage` indisponível: app continua funcional sem persistência; comunicar se necessário.
- Temporizador sem início: evitar divisão por zero; exibir 0 PPM.
- Tentativa cancelada e troca de modo: não substituir melhor resultado.
- Teclas modificadoras e auto-repeat não disparam avanço múltiplo.

## Sequência executada

1. Testes de caracterização do MVP (harness jsdom + relógio controlado).
2. Correção do resumo por transição de módulo, sem alterar os kernels de conclusão.
3. Ajuste de overflow e layout responsivo sem mudar markup pedagógico.
4. Endurecimento da leitura do `localStorage` e das métricas exibidas.
5. Acessibilidade do modal (Escape, foco preso, `inert`, rolagem).
6. Regressão automatizada dos dois modos, Enter, dashboard, storage e modal.

## Limitações conhecidas

- Colar o texto infla o PPM; não há teto nem detecção de colagem.
- O resumo exibe "Próximo módulo", mas Enter sempre avança uma lição; em conclusão fora de ordem o destino pode ser outra lição do mesmo módulo.
- O teclado virtual é simplificado e não cobre todo o ABNT2.
- Testes de usabilidade manual em Firefox/Safari e leitor de tela permanecem pendentes.

## Revisão técnica

Implementação e testes automatizados executados em 2026-11-17; revisão humana e aprovação de release pendentes.
