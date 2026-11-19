# ADR-0004 - Backend apenas para contas

- **Estado:** Accepted
- **Data:** 2026-11-18
- **Feature:** FEAT-003
- **Relacionado:** ADR-0001, Discover de contas e freemium

## Contexto

A primeira entrega aprovada pede conta de aluno, conta de administrador e dois painéis. O site publicado é estático no GitHub Pages. Senha e lista de alunos não podem ficar no HTML nem no `localStorage` de cada visitante: um administrador precisa ver as contas dos outros, e o navegador não é um lugar seguro para senha.

Esta entrega não inclui cobrança, trava das lições 7 a 12 nem certificado.

## Decisão

Criar um backend só para identidade e papéis em **Node.js + `pg`**, usando **PostgreSQL** como banco de dados. A prática continua no `index.html` atual, no GitHub Pages, com as chaves locais existentes. O backend guarda conta, papel e data de criação, além do hash da senha e da sessão. Não guarda senha em texto puro, não guarda cartão e não recebe o progresso da prática nesta feature.

Banco e runtime escolhidos em 18/11/2026: **PostgreSQL + Node.js**. O endereço de conexão virá de variável de ambiente (`DATABASE_URL`), funcionando primeiro com PostgreSQL local/Docker durante o desenvolvimento e depois com PostgreSQL gerenciado em produção, sem alterar o código da API.

## Alternativas consideradas

- **Login falso no `localStorage`:** não permite um administrador ver outros alunos e deixa a senha no navegador. Rejeitada.
- **Reescrever a prática junto com as contas:** contraria o ADR-0001. Rejeitada para esta entrega.
- **Incluir pagamento no mesmo backend agora:** a primeira entrega foi aprovada sem cobrança. Adiar.

## Consequências

- A prática publicada continua utilizável sem conta.
- Passa a existir um serviço com dados pessoais (e-mail e nome). A spec de implementação precisa definir retenção e exclusão antes do código.
- Há custo e operação de um serviço novo, separados do GitHub Pages.

## Aprovação

**Accepted** em 18/11/2026, pelo responsável pelo produto nesta sessão, com **PostgreSQL + Node.js** escolhidos para o backend. O backend fica restrito a contas e papéis. A prática permanece no site estático. A FEAT-003 aguarda apenas a aprovação do plano de arquivos/tarefas abaixo antes de iniciar a implementação em branch própria (`feature/feat-003`).
