# FEAT-004 - Tasks (planejamento em Draft)

Nenhuma tarefa abaixo está autorizada a começar. A ordem existe para mostrar a sequência e o custo real de cada etapa.

## Fase 0 - Decisões (bloqueiam tudo)

| ID | Tarefa | Depende de | Status |
|---|---|---|---|
| TASK-016 | Registrar a escolha entre progresso sincronizado (A) e local (B) | D1 | **Bloqueada** |
| TASK-017 | Escolher provedor de pagamento e escrever ADR comparando PIX/cartão, taxas, sandbox e webhooks | D2 | **Bloqueada** |
| TASK-018 | Definir modelo comercial (único/assinatura/por módulo) | D3 | **Bloqueada** |
| TASK-019 | Definir preços, moeda, reembolso e estorno | D4, D5 | **Bloqueada** |
| TASK-020 | Definir tratamento de quem já concluiu lições 7 a 12 localmente | D6 | **Bloqueada** |
| TASK-021 | Definir retenção de dados fiscais e texto de privacidade | D7 | **Bloqueada** |

## Fase 1 - Especificação detalhada

| ID | Tarefa | Critério | Status |
|---|---|---|---|
| TASK-022 | Detalhar esquema SQL (`entitlements`, e `progress` se opção A) e rotas da API | AC-019 a AC-028 | Pendente |
| TASK-023 | Escrever LLD da trava de módulo, emissão de certificado e verificação pública | RF-014, RF-017, RF-018 | Pendente |
| TASK-024 | Definir plano de testes (unitário, integração com provedor em sandbox, idempotência de webhook) | RNF-009, RNF-010 | Pendente |

## Fase 2 - Implementação (só após aprovação)

| ID | Tarefa | Critério | Status |
|---|---|---|---|
| TASK-025 | Criar migração de `entitlements` (+ `progress` se A) | AC-021, AC-023 | Pendente |
| TASK-026 | Implementar checkout e webhooks com verificação de assinatura | RF-016, RNF-008, RNF-009 | Pendente |
| TASK-027 | Travar lições 7 a 12 na interface e na API | AC-020 | Pendente |
| TASK-028 | Exibir situação de pagamento no painel do aluno e no admin | RF-019, RF-021, AC-026 | Pendente |
| TASK-029 | Emitir certificado no servidor com código de verificação | RF-017, RF-018, AC-024, AC-025 | Pendente |
| TASK-030 | Implementar exclusão/anonimização de dados de pagamento | RNF-011, AC-027 | Pendente |

## Fase 3 - Verificação e release

| ID | Tarefa | Critério | Status |
|---|---|---|---|
| TASK-031 | Testes automáticos com TEST-030 a TEST-040 | AC-019 a AC-028 | Pendente |
| TASK-032 | Fluxo manual em sandbox do provedor (PIX e cartão aprovado/recusado/estornado) | AC-021, AC-022 | Pendente |
| TASK-033 | Revisão de segurança: webhook, idempotência, ausência de dados de cartão | RNF-008, RNF-009, RNF-010 | Pendente |
| TASK-034 | Evidência de verificação e nota de release | Definition of Done | Pendente |

## Testes previstos

| ID | Teste | Requisito |
|---|---|---|
| TEST-030 | Sem conta, lições 1 a 6 funcionam e 7 a 12 bloqueiam | AC-019, AC-020 |
| TEST-031 | API devolve 403 para conteúdo pago sem direito | AC-020 |
| TEST-032 | Webhook aprovado cria direito uma única vez | AC-021, AC-023 |
| TEST-033 | Webhook duplicado é idempotente | AC-023, RNF-010 |
| TEST-034 | Estorno/cancelamento revoga direito | AC-022 |
| TEST-035 | Certificado negado sem conclusão no servidor | AC-024 |
| TEST-036 | Certificado negado sem taxa paga | AC-024 |
| TEST-037 | Verificação pública não expõe dados pessoais | AC-025, RNF-008 |
| TEST-038 | Admin vê status de pagamento sem dados de cartão | AC-026 |
| TEST-039 | Exclusão de conta remove dados de pagamento | AC-027, RNF-011 |
| TEST-040 | `localStorage` intacto após fluxo de compra | AC-028, RNF-013 |
