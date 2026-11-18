# FEAT-002 - Continuidade da sessão

- **Estado:** Release autorizado em 17/11/2026.
- **Origem:** verificação do site publicado em 17/11/2026, depois do release da FEAT-001.
- **Requisitos relacionados:** RF-001, RF-005, RF-006. A fórmula de PPM aprovada não muda.

## História de usuário

Como estudante, quero voltar ao navegador e continuar na lição em que parei, e quero que o PPM mostrado ao terminar seja o mesmo que ficou salvo.

## Incluído

- Gravar o índice da lição aberta em `digitar-pro-current-lesson`.
- Ao carregar, abrir esse índice quando for um inteiro de 0 a 11.
- Índice ausente ou inválido abre a lição 0 e grava `0`.
- Troca pela trilha, Enter e limpeza do progresso atualizam o índice. Limpar o progresso volta à lição 0 e mantém `digitar-pro-typing-mode`.
- Depois da conclusão, a tela mostra o PPM, a precisão e o tempo do cálculo que foi gravado.

## Excluído

Novas lições, metas, níveis, banco, contas, nuvem e mudança da fórmula de PPM.

## Critérios de aceitação

- **AC-010:** dado um índice válido salvo, ao recarregar, a lição correspondente abre e `ad-typing-mvp-v1` permanece igual.
- **AC-011:** dado índice ausente, `99` ou texto inválido, a lição 0 abre.
- **AC-012:** ao concluir, o PPM da mensagem e o PPM do painel são o valor gravado em `last.wpm`, mesmo que o relógio avance antes do próximo desenho.
- **AC-013:** limpar o progresso apaga os resultados, volta à lição 0 e conserva o modo.

## Aprovação

Release autorizado em 17/11/2026. A fórmula de PPM, as 12 lições e a chave `ad-typing-mvp-v1` permanecem. Evidência: `npm test` com 50 testes passando e verificação local da lição 5 com PPM 217 na tela, na mensagem e no registro.
