# LLD - Lógica de digitação, persistência e interface

**Status:** Draft | **Relacionado:** RF-001 a RF-012

## Contratos internos sugeridos

- `loadLesson(index)`: reinicia tentativa corrente e atualiza título, objetivo, texto e indicadores.
- `evaluateAttempt(input, expected, mode, elapsed)`: retorna erros, precisão, PPM e `completed`; função pura recomendada para testes.
- `advanceLesson()`: somente após `completed`; evita avanço duplo por Enter.
- `storeResult(index, result)`: mantém compatibilidade com os registros antigos.
- `moduleSummary(module)`: utiliza somente dados efetivos do histórico.
- `renderDashboard(progress)`: derivação imutável do estado persistido.

A implementação atual usa funções equivalentes dentro de `index.html`. Os nomes sugeridos **não existem necessariamente** no código; o Qoder deve mapear e adaptar, sem fingir que a refatoração já foi feita.

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
  if modal open: continue from summary
  else if completed: advance once
  else: prevent newline in textarea; remain
```

## UI e acessibilidade

- Trilha acessível por Tab e seleção sem foco perdido.
- Input com rótulo, instrução breve e estado de erro.
- Modal com foco inicial, prevenção de navegação indevida e retorno de foco a um controle adequado; testar Escape/Tab de acordo com decisão de UX.
- Scroll natural para desktop; horizontal navegável por toque e teclado em telas estreitas; preservar acesso ao conteúdo.
- `prefers-reduced-motion` para animações.
- Usar `textContent` ou escape ao renderizar dados; não confiar em texto importado.
- Indicadores com nomes textuais, não apenas cor.

## Tratamento de falhas

- `localStorage` indisponível: app continua funcional sem persistência; comunicar se necessário.
- Temporizador sem início: evitar divisão por zero; exibir 0 PPM.
- Tentativa cancelada e troca de modo: não substituir melhor resultado.
- Teclas modificadoras e auto-repeat não disparam avanço múltiplo.

## Sequência

1. Testes de caracterização do MVP.
2. Isolar cálculo e estado quando seguro.
3. Ajustar visual e fluxo sem alterar contratos.
4. Executar regressão dos dois modos e armazenamento.
5. Documentar limitações observadas.

## Revisão técnica

Pendente.
