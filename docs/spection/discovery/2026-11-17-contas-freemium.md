# Discover — contas, painéis, freemium e certificado

- **Data:** 17/11/2026
- **Estado:** Corte do grátis aprovado em 17/11/2026. Primeira entrega aprovada em 18/11/2026: contas, papéis e painéis, sem cobrança e sem travar lições. Backend ainda não aprovado. Implementação não autorizada.
- **Relação:** o Product Brief aprovado exclui login, backend, pagamentos e certificados. Este documento reabre esse escopo. Não altera a FEAT-001 nem a FEAT-002 até haver spec e ADR aceitos.

## Pedido

O aluno precisa de uma área própria. O administrador precisa de um painel. O acesso passa a ter login. O aluno pode baixar um certificado. A prática é gratuita até um limite; depois disso, continuar exige pagamento. O certificado tem uma taxa separada.

## O que o sistema publicado faz hoje

O Digitar Pro Academy é um site estático no GitHub Pages. A prática, o progresso e a última lição ficam no navegador (`ad-typing-mvp-v1`, `digitar-pro-typing-mode`, `digitar-pro-current-lesson`). Não há servidor, banco, conta nem cobrança. Um certificado gerado só no navegador poderia ser alterado por quem usa a página. Login e pagamento reais não cabem nesse desenho.

## Personas

| Pessoa | Precisa | Não entra nesta proposta |
|---|---|---|
| Aluno | Entrar, ver o próprio painel, praticar até o limite grátis, pagar para continuar e pagar para obter o certificado | Ranking público, turma, IA |
| Administrador | Entrar em área separada, ver alunos, situação da prática e situação dos pagamentos | Editar o texto das lições nesta primeira spec |
| Visitante | Experimentar o trecho grátis | Conta obrigatória antes da primeira lição |

## Regras propostas, ainda em rascunho

1. A prática atual permanece. Treinamento, Precisão, Enter e as 12 lições não mudam de regra.
2. O progresso já salvo no navegador não é apagado. A cópia para uma conta fica para uma spec própria, com teste de não perda.
3. **Corte aprovado em 17/11/2026:** os módulos 1 e 2 (lições 1 a 6) são gratuitos. Os módulos 3 e 4 (lições 7 a 12) exigem o pagamento da prática. O certificado continua com uma taxa separada. Pagar uma taxa não concede a outra.
4. O certificado só fica disponível quando as lições exigidas estão concluídas e a taxa do certificado está paga. Concluir o curso sem essa taxa não libera o arquivo.
5. O arquivo do certificado é produzido no servidor, com o nome do aluno e a data. O navegador não decide sozinho que a pessoa tem direito.
6. Dados de cartão não ficam no Digitar Pro. A cobrança passa por um provedor. Preço, moeda e provedor não estão definidos. Não inventar valores.
7. O administrador vê alunos, progresso e se cada taxa foi paga. Não vê senha.
8. Senha, e-mail e nome são dados pessoais. A spec de implementação precisa dizer o que é guardado, por quanto tempo e como a pessoa pede exclusão.

## O que bloqueia o código

- O corte do grátis está decidido: módulos 1 e 2 grátis; módulos 3 e 4 pagos.
- A primeira entrega está decidida em 18/11/2026: contas, papéis e os dois painéis. Nesta entrega não há cobrança e as lições 7 a 12 continuam acessíveis.
- O preço de cada taxa e o provedor de pagamento ficam para a entrega seguinte.
- O [ADR-0004](../adr/ADR-0004-backend-contas.md) foi aceito em 18/11/2026 com **PostgreSQL** como banco de dados; a prática permanece no site estático. Falta aprovar o desenho da API, o esquema SQL, a política de exclusão de dados e onde o backend será hospedado.

## Fora até nova decisão

Banco escolhido, tela de pagamento, emissão de certificado, ampliação para 60 lições, metas, níveis, área do docente por turma, Kids, Business e Schools.

## Sequência sugerida

1. Corte do grátis aprovado em 17/11/2026.
2. Primeira entrega aprovada em 18/11/2026: contas, papéis e painéis, sem cobrança. Spec em [FEAT-003](../../../specs/FEAT-003-contas-paineis/feature-spec.md).
3. ADR-0004 aceito em 18/11/2026 com PostgreSQL escolhido como banco. Falta aprovar o desenho da API/SQL e onde a API será hospedada antes de implementar. Publicar só com autorização.
4. Pagamento da prática, trava das lições 7 a 12 e certificado entram numa spec posterior, com preços definidos.
