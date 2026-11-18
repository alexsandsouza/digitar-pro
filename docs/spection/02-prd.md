# PRD - Digitar Pro Academy (brownfield)

**Status:** Draft | **Base:** `main` MVP 0.5 e PR de redesign 0.6 ainda em revisão.

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
- Enter só avança em estado concluído; no modal de módulo, Enter segue o próximo módulo.
- Modal de conclusão depende da conclusão de todas as lições daquele módulo.
- Trocar de modo reinicia tentativa atual, não apaga histórico.
- A fórmula atual estima PPM usando caracteres corretos / 5 / tempo em minutos, e precisão usa acertos / caracteres digitados; diferenças entre precisão por tentativa e média por lição devem ser documentadas.

## Dados e privacidade

Atualmente histórico no `localStorage` (chave `ad-typing-mvp-v1`) e preferência em `digitar-pro-typing-mode`. Não há conta, nuvem, nem dados sensíveis necessários à prática. Contadores externos de visualização podem gerar requisições à terceiros e exigem revisão/aviso adequado antes de expandir analytics.

## Dependências e exclusões

GitHub Pages e APIs nativas do navegador. Serviços de autenticação, pagamento, relatórios docentes, certificados e IA estão fora desta etapa.

## Questões abertas e aceite

- Métrica de PPM deve usar erros corrigidos? Definir depois de testes e decisão de produto.
- Política de exibição de lições com erros: conclusão sem exigência mínima de precisão é comportamento atual e deve ser validado pedagogicamente.
- Aprovação de escopo, UI, desempenho e release: **pendente**.
