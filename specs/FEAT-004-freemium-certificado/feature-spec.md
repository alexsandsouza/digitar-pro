# FEAT-004 - Freemium da prática e certificado

- **Estado:** **Draft — em revisão.** Nenhuma implementação autorizada. Preço, moeda e provedor de pagamento **não** foram definidos e não podem ser inventados.
- **Origem:** [Discover de contas e freemium](../../docs/spection/discovery/2026-11-17-contas-freemium.md)
- **Depende de:** FEAT-003 (contas, papéis e painéis) — implementada e em produção.
- **Regra comercial já aprovada em 17/11/2026:** módulos 1 e 2 (lições 1 a 6) gratuitos; módulos 3 e 4 (lições 7 a 12) exigem pagamento da prática; o certificado tem taxa separada; pagar uma taxa não concede a outra.
- **Meio de pagamento decidido em 21/11/2026:** **PIX** ([ADR-0007](../adr/ADR-0007-pagamento-pix.md)). Provedor ainda em aberto (D2b).

## Problema

Hoje as 12 lições são praticáveis por qualquer visitante e o progresso vive apenas no `localStorage` do navegador. Isso torna impossível:
- liberar as lições 7 a 12 somente após pagamento;
- emitir certificado confiável (o navegador não pode atestar conclusão);
- o administrador ver situação de pagamento por aluno.

## Tensão arquitetural que precisa de decisão

O progresso é **local**. Para travar módulos e emitir certificado, o servidor precisa saber quais lições o aluno concluiu. Há dois caminhos:

| Opção | O que exige | Consequência |
|---|---|---|
| **A. Sincronizar progresso com o servidor** | nova tabela de progresso + endpoint de sync + resolução de conflito com o `localStorage` | permite trava e certificado confiáveis; amplia escopo (é a "spec própria" citada no Discover) |
| **B. Progresso continua local e o servidor confia no cliente** | só tabela de entitlements | mais simples, porém **certificado não é confiável** e a trava é contornável |

**Recomendação:** Opção **A**, com o `localStorage` mantido como fonte de uso offline e o servidor como fonte de verdade para direito a módulo e certificado. Se A for escolhida, esta feature absorve a sincronização de progresso — decisão que o Discover deixava para spec posterior.

## Incluído (proposto)

- Modelo de **direitos** (entitlements): quais produtos cada aluno pagou (`practice`, `certificate`), com status e referência do provedor.
- **Trava das lições 7 a 12** na interface e na API, com liberação após pagamento da prática.
- **Taxa do certificado** separada, disponível apenas com lições exigidas concluídas **e** taxa paga.
- **Emissão do certificado no servidor**, com nome, data e código de verificação.
- **Painel admin**: situação de pagamento por aluno (nunca dados de cartão).
- Sincronização de progresso necessária para a trava e o certificado (se Opção A).

## Excluído

- Definição de preço, moeda, parcelamento, cupom ou política de reembolso (depende de decisão humana).
- Escolha e integração do provedor de pagamento (depende de decisão humana + ADR).
- Guarda de dados de cartão.
- Ampliação para 60 lições, metas, níveis, turmas, Kids, Business e Schools.

## Requisitos funcionais (propostos)

| ID | Requisito |
|---|---|
| RF-013 | As lições 1 a 6 permanecem acessíveis sem conta e sem pagamento, como hoje. |
| RF-014 | As lições 7 a 12 exigem direito ativo de prática; sem ele, a interface informa o bloqueio e oferece a compra. |
| RF-015 | A API recusa acesso a conteúdo pago sem direito ativo, mesmo com requisição manual. |
| RF-016 | A conclusão paga é registrada no servidor com data e identificação do aluno. |
| RF-017 | O certificado só é emitido quando as lições exigidas estiverem concluídas no servidor e a taxa do certificado estiver paga. |
| RF-018 | O certificado tem código público de verificação que confirma autenticidade sem expor dados além de nome e data. |
| RF-019 | O administrador vê, por aluno, se prática e certificado estão pagos; não vê dados de cartão. |
| RF-020 | Pagamento aprovado, cancelado, estornado e reembolsado atualizam o direito correspondente de forma idempotente. |
| RF-021 | O aluno vê sua situação de pagamento e o que falta para liberar módulo ou certificado. |
| RF-022 | A cobrança gera QR Code e código copia-e-cola do PIX, com validade explícita e possibilidade de gerar nova cobrança após expirar. |
| RF-023 | O direito só é concedido após confirmação do provedor via webhook; cobrança criada, aguardando ou expirada não libera nada. |
| RF-024 | A tela de espera reflete o estado real da cobrança (aguardando, pago, expirado, devolvido) sem exigir recarregar a página. |

## Requisitos não funcionais (propostos)

| ID | Requisito |
|---|---|
| RNF-008 | Nenhum dado de cartão trafega ou é armazenado pelo Digitar Pro; apenas identificadores do provedor. Com PIX como único meio, não existe cartão no sistema. |
| RNF-014 | A chave do provedor e a verificação de assinatura ficam apenas no servidor, nunca no cliente. |
| RNF-015 | A idempotência usa o identificador único da transação no provedor (`txid`/`endToEndId`/id de evento), nunca e-mail ou valor. |
| RNF-009 | Webhooks do provedor exigem verificação de assinatura e são idempotentes por id de evento. |
| RNF-010 | Direitos e certificados sobrevivem a reenvio de webhook, duplicidade e concorrência. |
| RNF-011 | Exclusão de conta remove ou anonimiza dados pessoais e mantém apenas o mínimo fiscal/contábil exigido por lei, documentado. |
| RNF-012 | A prática gratuita não piora: sem conta, as lições 1 a 6 seguem funcionando offline. |
| RNF-013 | `localStorage` existente (`ad-typing-mvp-v1`, `digitar-pro-typing-mode`, `digitar-pro-current-lesson`) nunca é apagado pela introdução de cobrança. |

## Critérios de aceitação (propostos)

- **AC-019:** visitante sem conta conclui normalmente as lições 1 a 6.
- **AC-020:** aluno sem direito de prática vê as lições 7 a 12 bloqueadas, com motivo e caminho de compra, e a API responde `403` se chamada diretamente.
- **AC-021:** após pagamento confirmado, as lições 7 a 12 liberam sem novo login e o direito aparece no painel do aluno.
- **AC-022:** pagamento não confirmado, cancelado ou estornado não libera nem mantém liberação indevida.
- **AC-023:** webhook duplicado não cria direito duplicado nem cobra duas vezes.
- **AC-024:** certificado não é emitido sem conclusão registrada no servidor e sem taxa paga.
- **AC-025:** código de verificação confirma o certificado e não expõe e-mail, senha ou dados de pagamento.
- **AC-026:** admin vê situação de pagamento por aluno e a resposta não contém dados de cartão.
- **AC-027:** excluir a conta não deixa dados pessoais de pagamento órfãos.
- **AC-028:** os três registros locais da prática permanecem intactos após qualquer fluxo de compra.
- **AC-029:** cobrança PIX criada e não paga não libera módulo nem certificado; a tela mostra "aguardando pagamento" ou "expirado".
- **AC-030:** após devolução/estorno do PIX, o direito correspondente é revogado de forma idempotente e o aluno vê o motivo.

## Decisões necessárias antes de implementar

| # | Decisão | Quem decide | Situação |
|---|---|---|---|
| D1 | Opção A (sincronizar progresso) ou B (progresso local) | Produto + técnico | **Aberto** |
| D2 | Meio de pagamento | Produto | **Decidido em 21/11/2026: PIX** ([ADR-0007](../adr/ADR-0007-pagamento-pix.md)) |
| D2b | Provedor de pagamento PIX (webhook assinado, sandbox, devolução via API) | Produto + técnico | **Aberto** — ver ADR-0007 |
| D3 | Modelo comercial: pagamento único, assinatura ou por módulo | Produto | **Aberto** — PIX favorece pagamento único; assinatura exigiria PIX Automático |
| D4 | Preço da prática e do certificado, com moeda | Produto | **Aberto** |
| D5 | Política de reembolso e de estorno | Produto | **Aberto** |
| D6 | O que acontece com quem já concluiu as lições 7 a 12 pelo `localStorage` | Produto | **Aberto** |
| D7 | Retenção de dados fiscais/contábeis e texto de privacidade | Produto + jurídico | **Aberto** |

Nenhuma dessas decisões foi tomada. Este documento existe para tornar as escolhas explícitas, não para presumi-las.

## Fora até decisão

Código de cobrança, tela de pagamento, integração com provedor, trava em produção e emissão real de certificado.

## Aprovação

**Não aprovado.** Estado Draft; requer decisões D1–D7 e revisão humana antes de virar plano de implementação.
