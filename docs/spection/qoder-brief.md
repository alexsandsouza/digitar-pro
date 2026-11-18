# Prompt de implementação para Qoder

> Use este conteúdo no Qoder IDE / Agent ou Planning. Primeiro peça plano, só depois autorize implementação.

## Contexto

Estou desenvolvendo **Digitar Pro Academy**, um software de digitação em PT-BR hospedado no GitHub Pages. Repositório: `https://github.com/alexsandsouza/digitar-pro`. Quero desenvolver com o framework SPECTION: https://github.com/alexsandsouza/spection. O projeto já possui MVP funcional; **não reescreva do zero**.

Leia obrigatoriamente o `AGENTS.md`, o Product Brief, PRD, HLD, LLD, ADR-0001 e a pasta `specs/FEAT-001-experiencia-aprendizagem`. Compare `main` com a PR #1 (`feature/premium-v0.6`) antes de propor mudanças. Brief, PRD, HLD, LLD, ADR-0001 a ADR-0003 e a FEAT-001 foram aprovados em 17/11/2026, e o release pela PR #3 foi autorizado na mesma data. Qualquer mudança nova volta a exigir plano antes da implementação.

## Primeira tarefa

1. Inspecione o código e descreva o funcionamento real dos modos Treinamento e Precisão, Enter, métricas, dashboard, conquista e localStorage.
2. Identifique regressões potenciais entre main e a branch de redesign.
3. Apresente um plano incremental por TASK-001 a TASK-008, com arquivos afetados e risco.
4. Crie testes automatizados adequados ao projeto antes de refatoração funcional; teste manualmente telas e fluxo quando possível.
5. Só implemente mudanças de FEAT-001 após minha aprovação do plano.
6. Registre evidências reais e abra Pull Request para revisão. Não faça merge ou deploy sem minha aprovação.

## Regras essenciais

- Manter conteúdo e histórico existente; não apagar registros de alunos.
- Treinamento conclui no fim do texto mesmo com erros, registrando precisão real.
- Precisão exige todos os caracteres corretos antes de concluir.
- Enter avança somente após concluir e nunca pula duas lições.
- Manter progresso local e 12 lições existentes.
- Melhorar UX/UI e acessibilidade sem piorar desktop/mobile.
- Evitar bibliotecas e backend desnecessários.
- Documentar decisões relevantes em ADR.
- Reportar testes com comando, data, resultado e evidência; não inventar números.

**Saída inicial esperada:** um plano revisável, riscos, matriz requisito → teste e perguntas verdadeiramente bloqueantes. Não executar alterações antes da minha aprovação.
