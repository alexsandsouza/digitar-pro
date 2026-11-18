# Product Brief - Digitar Pro Academy

- **Responsável pelo produto:** Alexsand Farias de Souza
- **Versão/data:** 0.1 / 17-11-2026
- **Status:** Aprovado em 17/11/2026

## Problema

Iniciantes e profissionais precisam praticar digitação de modo guiado, com feedback de erros, evolução mensurável e baixo atrito para começar. O MVP atual cobre esse fluxo, mas tem limitações de experiência, currículo, acessibilidade e manutenção. A necessidade comercial e o impacto educacional ainda exigem validação com usuários.

## Usuários e stakeholders

| Persona | Necessidade | Limite atual |
|---|---|---|
| Estudante iniciante | Orientação simples e treino sem punição | 12 exercícios, teclado simplificado |
| Estudante em aperfeiçoamento | Precisão, ritmo e evolução | Métricas educativas e histórico local |
| Docente | Recomendar prática e avaliar progresso | Sem área de turma |
| Gestor do produto | Evolução sustentável e potencial comercial | Sem autenticação ou cobrança |

## Resultados e indicadores propostos

- **Conclusão:** % das sessões iniciadas que concluem ao menos uma lição.
- **Eficiência:** tempo mediano para iniciar a primeira digitação desde a entrada.
- **Aprendizagem:** evolução de precisão e PPM por tentativa; interpretar com cuidado, sem alegar eficácia sem estudo.
- **Qualidade:** 0 bloqueios críticos em Enter/progresso nos cenários de teste; validação em desktop e mobile.
- **Acessibilidade:** avaliação de teclado e contraste, com testes reproduzíveis.

Metas numéricas de negócio dependem de linha de base; **não inventar percentuais-alvo**.

## Escopo de evolução incremental

**Incluído:** aprimorar UX/UI, fluxo pedagógico, métricas, acessibilidade, organização do código, testes de regressão e rastreabilidade.

**Excluído nesta fase:** login, backend, pagamentos, ranking público, certificados, sincronização em nuvem, inteligência artificial, funcionalidades Kids/Business/Schools. São possibilidades de roadmap, não entregas contratadas.

## Restrições

- Manter o GitHub Pages, frontend sem build obrigatório nesta etapa.
- Compatibilidade com `localStorage` existente, especialmente a chave `ad-typing-mvp-v1`.
- Evoluir incrementalmente o HTML/CSS/JS atual, sem reescrita desnecessária.
- Dependências externas opcionais devem ser avaliadas (privacidade, performance, fallback).
- Não publicar na branch `main` sem revisão e teste.

## Riscos iniciais

| Risco | Efeito | Mitigação |
|---|---|---|
| Perda de progresso | Alto | Teste de compatibilidade e rollback |
| Erro na navegação Enter | Alto | Testes nos dois modos, inclusive com erros |
| Medição de PPM incorreta | Médio | Fórmula explícita e testes |
| UX ruim em mobile | Médio | Testes 360 px, 768 px, desktop |
| Dependência externa de contador | Baixo/médio | Carregamento não bloqueante, aviso de privacidade |

## Aprovação

- Aprovador: responsável pelo produto, nesta sessão
- Decisão/data: **Aprovado** em 17/11/2026
- Escopo: problema, personas, indicadores sem meta numérica inventada, evolução incremental e exclusões desta fase
- Reafirmado em 17/11/2026: banco, contas, nuvem e as demais exclusões desta fase continuam fora.
- Release da FEAT-001 autorizado em 17/11/2026, com a verificação manual complementar ainda pendente.
