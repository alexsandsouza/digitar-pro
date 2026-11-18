# PRD - Digitar Pro Academy (brownfield)

**Status:** Aprovado em 17/11/2026 | **Release:** autorizado em 17/11/2026 pela PR #3. A verificação manual complementar permanece pendente.

## Jornadas-chave

1. Visitante abre o site, escolhe modo, lê objetivo e inicia a digitação.
2. Estudante conclui com erro no Treinamento, recebe métricas e avança com Enter.
3. Estudante conclui no Precisão apenas após corrigir os erros, e então avança.
4. Estudante conclui três lições de um módulo e visualiza a conquista e resumo.
5. Usuário retorna ao navegador e encontra seu progresso anterior.

## Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceitação | Responsável |
|---|---|---|---|---|
| RF-001 | Exibir trilha e lição atual com estado concluído/pendente | Must | Dado progresso salvo, ao carregar, os estados correspondem aos registros | Qoder |
| RF-002 | Treinamento permite concluir ao atingir comprimento do texto mesmo com erros | Must | Dado erro no texto, quando completar comprimento, a lição termina e erros influenciam precisão | Qoder |
| RF-003 | Precisão exige texto exatamente correto | Must | Dado erro, ao atingir comprimento, não conclui até correção | Qoder |
| RF-004 | Enter avança apenas após conclusão válida | Must | Dado exercício inacabado, Enter não avança; dado concluído, avança uma única vez | Qoder |
| RF-005 | Mostrar PPM, precisão, tempo e progresso | Must | Durante/ao fim, valores derivam do texto e cronômetro; resultado documenta a fórmula | Qoder |
| RF-006 | Persistir melhores/últimos resultados e modo localmente | Must | Dado resultado salvo, ao atualizar a página, ele permanece disponível | Qoder |
| RF-007 | Exibir resumo e conquista ao completar módulo | Must | Dadas todas lições do módulo concluídas, exibir métricas e conquista | Qoder |
| RF-008 | Tornar lição principal facilmente visível e teclado opcional | Should | Dada viewport suportada, campo e objetivo aparecem com hierarquia clara; ocultar teclado não impede prática | Qoder |
| RF-009 | Dashboard pessoal derivado do progresso, sem backend | Should | Dado histórico local, indicadores são consistentes e não usam números inventados | Qoder |
| RF-010 | Instruções pedagógicas curtas por lição | Should | Dada lição selecionada, objetivo e feedback contextual aparecem | Qoder |
| RF-011 | Permitir reiniciar lição e repetir módulo | Must | Reiniciar limpa tentativa atual sem apagar histórico, repetir volta ao início do módulo | Qoder |
| RF-012 | Melhorar scroll e foco em modal/trilha | Should | Conteúdo acessível sem barras intrusivas e rolagem/foco de teclado operantes | Qoder |

## Requisitos não funcionais

| ID | Qualidade | Meta verificável proposta | Verificação |
|---|---|---|---|
| RNF-001 | Compatibilidade | Funcionar em Chrome e Firefox atuais em desktop e mobile quando disponível | Matriz manual registrada |
| RNF-002 | Acessibilidade | Navegação por teclado, foco visível, contraste alinhado à WCAG 2.2 AA nas telas prioritárias | Auditoria + testes de teclado |
| RNF-003 | Disponibilidade | Publicação estática no GitHub Pages, sem backend obrigatório | Teste após deploy |
| RNF-004 | Persistência | Não perder registros existentes após atualização | Fixture antiga + recarga |
| RNF-005 | Desempenho | Sem bloqueios perceptíveis na digitação, inclusive após centenas de caracteres | Teste em navegador alvo |
| RNF-006 | Segurança | Sem `innerHTML` com dados não escapados de usuários; sem segredos no frontend | Revisão de código |
| RNF-007 | Reversibilidade | Mudanças em branch separada, PR e rollback documentado | Revisão Git |

## Regras de negócio

- No Treinamento, terminar a quantidade de caracteres prevista basta; erro **não** bloqueia conclusão.
- No Precisão, o texto precisa coincidir integralmente.
- Enter só avança em estado concluído, uma única vez. Com o resumo aberto, Enter avança para a lição seguinte do índice, sem salto duplo; o rótulo do botão ("Próximo módulo") pressupõe a conclusão em ordem.
- O modal de conclusão abre na transição do módulo para completo, inclusive quando as lições foram concluídas fora de ordem. Repetir uma lição de módulo já concluído não reabre o modal.
- Trocar de modo reinicia a tentativa atual, não apaga histórico.
- O dashboard usa o melhor PPM de cada lição (`wpm`) e a precisão da última tentativa (`last.accuracy`); a média de precisão exibida é a média simples entre lições com resultado.
- A fórmula atual estima PPM usando caracteres corretos / 5 / tempo em minutos, e precisão usa acertos / caracteres digitados; diferenças entre precisão por tentativa e média por lição devem ser documentadas.

## Fórmulas e semântica das métricas

| Indicador | Fórmula/regra | Observações |
|---|---|---|
| Erros | Comparação posicional entre o texto digitado (limitado ao tamanho esperado) e o texto da lição | Acentos e espaços contam como caracteres |
| Precisão | `round((digitados - erros) / digitados * 100)`; 100% quando nada foi digitado | Pode diminuir ao corrigir um trecho com Backspace |
| PPM | `round((caracteres corretos / 5) / (segundos / 60))`; 0 antes do primeiro input | Sem teto e sem desconto extra de erros. Colar o texto infla o valor. Decisão de produto em 17/11/2026: manter |
| Tempo | `Date.now() - início`; o início ocorre no primeiro input | Inclui pausas; o resumo soma o tempo das três últimas tentativas |
| Melhor PPM | `max(wpm)` por lição entre tentativas | `progress[i].wpm` |
| Precisão do dashboard | Média simples de `last.accuracy` entre lições com resultado | Não pondera pelo tamanho da lição |
| Resumo do módulo | Média simples de PPM e precisão das três últimas tentativas; tempo somado | Só existe com as três lições completas |

## Dados e privacidade

Atualmente histórico no `localStorage` (chave `ad-typing-mvp-v1`) e preferência em `digitar-pro-typing-mode`. Não há conta, nuvem, nem dados sensíveis necessários à prática. Contadores externos de visualização podem gerar requisições à terceiros e exigem revisão/aviso adequado antes de expandir analytics.

## Dependências e exclusões

GitHub Pages e APIs nativas do navegador. Serviços de autenticação, pagamento, relatórios docentes, certificados e IA estão fora desta etapa.

## Decisões de produto — 17/11/2026

O responsável pelo produto decidiu manter o comportamento atual em todos os pontos que ainda dependiam de escolha:

1. **PPM.** Permanece `caracteres corretos / 5 / minutos`, sem teto e sem desconto adicional de erros. Colagem continua inflando o valor; o risco fica registrado.
2. **Treinamento.** A lição conclui ao atingir o comprimento do texto, mesmo com erros. Não há precisão mínima. O modo Precisão continua exigindo o texto exato.
3. **Rótulo "Próximo módulo".** O texto do botão e o destino permanecem. Enter avança uma lição do índice, também quando o módulo foi concluído fora de ordem.
4. **Publicação.** Release autorizado em 17/11/2026. A PR #3 entra na `main`, e o GitHub Pages publica a partir dela. A verificação manual complementar permanece pendente.
5. **Verificação manual.** Screenshot, teclado físico, leitor de tela, Firefox, Safari e teste de usabilidade continuam pendentes. A FEAT-001 não fica Verified nem Released.
6. **Fora de escopo.** Banco, contas, nuvem, pagamentos, ranking, certificados e IA permanecem fora desta etapa.
