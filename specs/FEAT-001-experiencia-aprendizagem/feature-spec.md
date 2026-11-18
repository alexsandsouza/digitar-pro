# FEAT-001 - Experiência premium e confiável de aprendizagem

- **Estado:** Release autorizado em 17/11/2026 pela PR #3. A verificação manual complementar permanece pendente.
- **Requisitos relacionados:** RF-001 a RF-012, RNF-001 a RNF-007
- **Responsável pela implementação:** Qoder (supervisionado)
- **Escopo:** evolução brownfield, sem mudanças de infraestrutura

## História de usuário

Como estudante de digitação, quero praticar em uma interface clara, receber feedback correto e continuar com Enter, para melhorar minha velocidade e precisão sem perder meu histórico.

## Incluído

- Preservar Treinamento e Precisão e seus critérios de conclusão.
- Revisar barra de rolagem, responsividade, foco do campo e modal.
- Dashboard derivado do progresso local; nenhuma estatística inventada.
- Objetivo pedagógico e feedback conciso.
- Testes de regressão e evidências verificáveis.
- Revisão e integração do redesign 0.6 sem sobrescrever mudanças recentes na `main`.

## Excluído

Login, nuvem, pagamento, IA, certificados, Kids, Schools, Business, 60 novas lições e backend.

## Critérios de aceitação

- **AC-001 (RF-002):** dado um erro no Treinamento e texto de comprimento completo, então o exercício conclui e a precisão fica abaixo de 100%.
- **AC-002 (RF-003):** dado um erro no Precisão, quando chega ao fim do texto, então não conclui; após correção exata, conclui.
- **AC-003 (RF-004):** Enter antes da conclusão não muda lição nem insere quebra de linha; após conclusão avança exatamente uma vez.
- **AC-004 (RF-006):** após recarregar, registros da chave antiga ainda aparecem sem perda.
- **AC-005 (RF-007):** resumo do módulo só surge após as três lições dele concluídas.
- **AC-006 (RF-008, RF-012):** conteúdo rolável acessível em 360px, 768px e desktop, sem barra intrusiva visual.
- **AC-007 (RF-009):** cards do dashboard mostram somente valores calculados dos registros.
- **AC-008 (RNF-002):** foco de teclado visível nos controles e modal testado.
- **AC-009 (RNF-007):** PR revisada e release aprovado antes do merge.

## Casos de borda

Tentativas com espaços e caracteres acentuados, teclado ABNT2, Backspace, Enter mantido pressionado, usuário troca modo no meio, localStorage corrompido, rolagem no modal, zoom de navegador e tela pequena.

## Aprovações

- Decisão: **Aprovado** em 17/11/2026, pelo responsável pelo produto nesta sessão.
- Escopo: história, inclusão, exclusão e critérios AC-001 a AC-008, com a evidência automatizada e de navegador já registrada.
- Decisão de 17/11/2026: manter PPM sem teto, conclusão do Treinamento com erros e o rótulo "Próximo módulo".
- AC-009: release autorizado em 17/11/2026 pela PR #3. A verificação manual complementar permanece pendente.
- Verificação manual permanece aberta: screenshot, teclado físico, leitor de tela, Firefox, Safari e teste de usabilidade. A feature não está Verified nem Released.
