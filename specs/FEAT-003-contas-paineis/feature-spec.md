# FEAT-003 - Contas, papéis e painéis

- **Estado:** Aprovado e Release Autorizado em 18/11/2026 na branch `feature/feat-003`. Suíte com 55 testes aprovados e 1 skipped (PostgreSQL). Pronto para merge na `main`.
- **Origem:** [Discover de contas e freemium](../../docs/spection/discovery/2026-11-17-contas-freemium.md)
- **Fora desta entrega:** cobrança, trava das lições 7 a 12, certificado, preço e provedor de pagamento.

## História de usuário

Como aluno, quero entrar numa área minha. Como administrador, quero entrar numa área separada e ver as contas, sem acesso à senha de ninguém.

## Incluído

- Conta de aluno (cadastro aberto para alunos) e conta de administrador (criada por seed/variável de ambiente), com papéis distintos (`student` e `admin`).
- Login, criação de conta de aluno e saída da conta.
- Painel do aluno com a identificação da conta, dados básicos do perfil e retorno para a prática, com acesso estritamente limitado ao próprio cadastro (sem acesso a faturamento, métricas administrativas ou dados de outros usuários).
- Painel do administrador com a lista de contas: nome, e-mail, papel, status e data de criação (e área preparada para indicadores administrativos/faturamento em entrega futura), sem exibir senha ou hash.
- O aluno não abre o painel nem as rotas do administrador (`403` na API). O administrador não vê senha.
- Sair da conta não apaga `ad-typing-mvp-v1`, `digitar-pro-typing-mode` nem `digitar-pro-current-lesson`.
- As 12 lições continuam praticáveis, inclusive as lições 7 a 12.

## Excluído

Pagamento, bloqueio de módulo, emissão de certificado, sincronização do progresso com o servidor e reescrita da interface de prática.

## Critérios de aceitação

- **AC-014:** dado um aluno autenticado, ao abrir o painel administrativo ou chamar endpoints administrativos (usuários/faturamento futuro), a resposta é `403` e nenhuma informação administrativa é exibida.
- **AC-015:** dado um administrador autenticado, a lista de contas aparece sem senha, hash ou segredo.
- **AC-016:** ao sair da conta, os três registros locais da prática permanecem.
- **AC-017:** sem conta, as lições 1 a 12 continuam abrindo como hoje.
- **AC-018:** cadastro público cria apenas conta `student`; o papel `admin` não pode ser escolhido via cadastro público.

## Regra comercial já aprovada e não aplicada aqui

Os módulos 1 e 2 serão gratuitos e os módulos 3 e 4 exigirão pagamento. O certificado terá taxa separada. Nenhuma dessas cobranças é implementada nesta feature.

## Aprovação

Escopo, ADR-0004, PostgreSQL e runtime Node.js aprovados pelo responsável pelo produto em 18/11/2026. Implementação concluída na branch `feature/feat-003`; falta conectar a uma instância PostgreSQL real e autorizar PR/merge.
