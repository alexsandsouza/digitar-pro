# ADR-0007 - Meio de pagamento: PIX

- **Estado:** **Proposed** — meio de pagamento aceito pelo produto; **provedor em aberto**
- **Data:** 2026-11-21
- **Feature:** FEAT-004 (freemium da prática + certificado)
- **Relacionado:** ADR-0001, ADR-0004, ADR-0006, [FEAT-004](../../specs/FEAT-004-freemium-certificado/feature-spec.md)
- **Nota de numeração:** ADR-0005 não foi utilizado neste repositório; o ADR-0006 foi aceito antes deste.

## Contexto

A FEAT-004 precisa cobrar dois itens separados: o **acesso às lições 7 a 12** e a **taxa do certificado**. O público é brasileiro e o ticket é baixo. O Discover de 17/11/2026 já determina que **dados de cartão não ficam no Digitar Pro** e que a cobrança passa por um provedor.

Em 21/11/2026 o responsável pelo produto decidiu que o meio de pagamento será **PIX**.

## Decisão

1. **PIX é o meio de pagamento** da prática e do certificado. Não haverá captura de cartão nesta entrega.
2. O direito (`entitlement`) é concedido **exclusivamente** após confirmação de pagamento pelo provedor, nunca na criação da cobrança.
3. O modelo comercial fica alinhado a **pagamento único por item** (ver consequência 1).
4. O **provedor** ainda não foi escolhido — decisão D2b, separada e em aberto.

## Consequências técnicas do PIX

1. **PIX é, por natureza, pagamento à vista.** Assinatura/recorrência exigiria PIX Automático ou outro meio. Se o produto quiser assinatura, esta decisão precisa ser revista — não é um detalhe de configuração.
2. **Confirmação é assíncrona.** O fluxo é: cobrança criada → QR Code/copia-e-cola → aluno paga → provedor chama o webhook → direito concedido. Qualquer tela que libere acesso antes do webhook é uma falha de segurança.
3. **Expiração.** QR Code tem validade; cobranças abandonadas expiram. É preciso um estado explícito de "aguardando pagamento" e a possibilidade de gerar novo QR.
4. **Sem dado de cartão.** RNF-008 fica mais simples: nenhum PAN, bandeira ou CVV existe no sistema. Ainda assim, identificadores do provedor são dados a tratar.
5. **Devolução existe.** PIX admite devolução, inclusive por Mecanismo Especial de Devolução (MED) com regras do Banco Central. Portanto o direito **precisa ser revogável** após a concessão — não é um "pago para sempre" sem contrapartida técnica.
6. **Idempotência obrigatória.** Webhooks podem chegar repetidos ou fora de ordem. A chave deve ser o identificador único da transação no provedor (`txid`/`endToEndId`/id de evento), nunca o e-mail ou o valor.
7. **Sem segredo no cliente.** A chave do provedor e a verificação de assinatura ficam só no servidor (Vercel), como as atuais `DATABASE_URL` e `ADMIN_*`.

## Provedor — critérios de escolha (D2b, em aberto)

Nenhuma taxa, prazo ou condição comercial foi verificada nesta sessão; **não registrar valores sem consultar a tabela vigente do provedor**.

| Critério | Peso | Por quê |
|---|---|---|
| PIX com QR Code e copia-e-cola | obrigatório | é o meio decidido |
| Webhook com assinatura verificável | obrigatório | RNF-009 |
| Sandbox / ambiente de teste | obrigatório | sem ele não há como validar TEST-030 a TEST-040 |
| Documentação para Node.js serverless | alto | API roda em função na Vercel |
| Modelo de taxa e prazo de liquidação | alto | ticket baixo; taxa come o produto |
| Suporte a devolução/estorno via API | alto | consequência 5 |
| PIX Automático (se assinatura for desejada) | condicional | depende de D3 |

**Candidatos a avaliar** (ordem alfabética, sem preferência declarada): Asaas, Efí (Gerencianet), Mercado Pago, Pagar.me, PagBank, Stripe (Brasil).

## Alternativas consideradas

- **Cartão de crédito:** exigiria PCI e amplia superfície de risco; contraria o Discover. Rejeitada nesta entrega.
- **Boleto:** confirmação lenta (dias) e pior experiência para ticket baixo. Rejeitada.
- **PIX manual (chave estática + comprovante enviado):** sem verificação automática, depende de conferência humana e não escala. Rejeitada.
- **Cobrança via plataforma de infoprodutos:** menos controle sobre o fluxo de direitos e sobre o banco. Não descartada, mas adia a integração própria.

## O que este ADR não decide

Preço, moeda final, política de reembolso, provedor, e se o progresso passa a ser sincronizado (D1). Sem D1, o certificado continua não confiável, qualquer que seja o provedor.

## Aprovação

- **Meio de pagamento (PIX): aceito** em 21/11/2026 pelo responsável pelo produto.
- **Provedor:** pendente (D2b).
- **Estado do ADR:** Proposed até a escolha do provedor.
