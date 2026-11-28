# FEAT-005 - Learning Paths 0.7

Estado: implementação inicial em branch, revisão e release pendentes. Decisão do responsável: seis níveis, 24 módulos, 120 lições; não migrar progresso de testes anterior. Não apagar contas nem alterar backend.

## Aceite
- 6 níveis e 24 módulos com cinco lições cada; textos progressivos e contextualizados.
- Seleção por nível e módulo, contadores dinâmicos, conquista por módulo.
- Treinamento, Precisão e Enter preservam comportamento; armazenamento de progresso usa nova chave, sem apagar dados antigos.
- Acesso livre nesta etapa; metas de velocidade não bloqueiam a prática.
- Testes de regressão, teclado ABNT2, acessibilidade, revisão pedagógica e aprovação antes de merge/deploy.

## Riscos e rollback
Testes legados assumem 12 lições e precisam ser adaptados. Caracteres especiais exigem revisão do teclado visual. Reverter branch/PR preserva produção; chave anterior não é modificada. Certificação e cobrança permanecem fora do escopo.
