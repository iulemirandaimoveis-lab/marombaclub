# Maromba Club — Guia de Integração de Pagamentos

## Variáveis de Ambiente

```env
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# === SITE URL (para webhooks) ===
NEXT_PUBLIC_SITE_URL=https://marombaclub.com.br

# === GATEWAY ATIVO (pagbank | mercadopago | pagarme | demo) ===
DEFAULT_PAYMENT_PROVIDER=pagbank

# === PAGBANK / PAGSEGURO ===
PAGBANK_TOKEN=seu-token-aqui
PAGBANK_ENV=sandbox            # ou production
PAGBANK_WEBHOOK_SECRET=seu-secret

# === MERCADO PAGO ===
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=seu-secret

# === STONE / PAGAR.ME ===
PAGARME_SECRET_KEY=sk_test_...
PAGARME_PUBLIC_KEY=pk_test_...
PAGARME_WEBHOOK_SECRET=seu-secret

# === CORA PIX ===
CORA_CLIENT_ID=seu-client-id
CORA_CLIENT_SECRET=seu-client-secret
CORA_PIX_KEY=sua-chave-pix@exemplo.com

# === WEBHOOK GENÉRICO ===
PAYMENT_WEBHOOK_SECRET=secret-compartilhado
```

---

## Endpoints Internos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/payments/create` | Criar pagamento (Pix, cartão, cartão salvo) |
| `POST` | `/api/payments/webhooks` | Receber webhooks de qualquer gateway |
| `POST` | `/api/orders` | Criar pedido |
| `POST` | `/api/driver/location` | Atualizar localização do entregador |

---

## Fluxo Pix

```
1. Cliente finaliza carrinho → POST /api/orders → retorna order_id
2. Cliente escolhe Pix → POST /api/payments/create { order_id, method: "pix" }
3. API cria pagamento no gateway → retorna pix_copy_paste + pix_qr_code
4. Cliente copia código ou escaneia QR
5. Gateway envia webhook → POST /api/payments/webhooks?provider=pagbank
6. Webhook atualiza payments.status = "paid"
7. Webhook atualiza orders.status = "PAGO"
8. Webhook credita loyalty_points_ledger
```

### Exemplo de request

```json
POST /api/payments/create
{
  "order_id": "uuid",
  "method": "pix",
  "cpf": "12345678901"
}
```

### Exemplo de response

```json
{
  "success": true,
  "payment_id": "uuid",
  "provider": "pagbank",
  "method": "pix",
  "status": "pending",
  "pix_copy_paste": "00020101021226...",
  "pix_qr_code": "https://...",
  "expires_at": "2026-05-26T10:00:00.000Z"
}
```

---

## Fluxo Cartão

```
1. Front-end tokeniza cartão usando SDK do gateway (nunca envie dados do cartão direto)
2. POST /api/payments/create { order_id, method: "credit_card", card_token: "tok_xxx" }
3. API processa pagamento no gateway
4. Se aprovado → retorna status: "paid"
5. Se recusado → retorna 402 com reason
```

### Tokenização PagBank (front-end)

```js
import PagSeguro from "@pagseguro/payment-js";

const encryptedCard = PagSeguro.encryptCard({
  publicKey: process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY,
  holder: "NOME DO TITULAR",
  number: "4111111111111111",
  expMonth: "12",
  expYear: "2030",
  securityCode: "123",
});
```

### Tokenização Mercado Pago (front-end)

```js
const mp = new MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
const cardToken = await mp.createCardToken({
  cardNumber: "4111111111111111",
  cardholderName: "NOME TITULAR",
  cardExpirationMonth: "12",
  cardExpirationYear: "2030",
  securityCode: "123",
});
```

---

## Fluxo Cartão Salvo (1 clique)

```
1. Na primeira compra com cartão, enviar save_card: true
2. API salva token em customer_payment_methods (nunca o número real)
3. Nas próximas compras, listar GET /api/payments/saved-cards
4. Cliente escolhe cartão salvo → POST /api/payments/create { saved_card_id: "uuid" }
5. API usa provider_card_id salvo para cobrar sem novo token
```

### Campos salvos (nunca dados sensíveis)

```
customer_payment_methods:
  - provider: "pagbank" | "mercadopago" | "pagarme"
  - provider_card_id: "CARD_XXXX" (token do gateway)
  - brand: "VISA"
  - last4: "1111"
  - exp_month: 12
  - exp_year: 2030
  - holder_name: "NOME TITULAR"
```

---

## Webhooks

### URL de webhook

```
https://marombaclub.com.br/api/payments/webhooks?provider=pagbank
https://marombaclub.com.br/api/payments/webhooks?provider=mercadopago
https://marombaclub.com.br/api/payments/webhooks?provider=pagarme
```

### Idempotência

Todo webhook é salvo em `payment_webhook_events` com `(provider, event_id)` único. Duplicatas são ignoradas silenciosamente.

### Eventos processados

| Status do gateway | Ação |
|-------------------|------|
| `paid` / `PAID` | Atualiza pagamento para `paid`, pedido para `PAGO`, credita pontos |
| `refused` / `DECLINED` | Atualiza para `refused` |
| `cancelled` / `CANCELADO` | Atualiza para `cancelled`, pedido para `CANCELADO` |
| `refunded` | Atualiza para `refunded` |

---

## Como Configurar Cada Gateway

### PagBank / PagSeguro

1. Criar conta em sandbox.pagseguro.uol.com.br
2. Acessar Developer Console → Credentials
3. Copiar **Token de Integração** → `PAGBANK_TOKEN`
4. Configurar webhook URL no painel → `/api/payments/webhooks?provider=pagbank`
5. Para produção: mudar `PAGBANK_ENV=production`

**Documentação oficial:** https://dev.pagbank.uol.com.br/reference

---

### Mercado Pago

1. Criar conta em mercadopago.com.br/developers
2. Acessar "Suas integrações" → criar aplicação
3. Copiar **Access Token** de teste → `MERCADOPAGO_ACCESS_TOKEN`
4. Copiar **Public Key** → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
5. Configurar webhook: Integrações → Webhooks → URL da notificação

**Documentação oficial:** https://www.mercadopago.com.br/developers/pt/docs

---

### Stone / Pagar.me

1. Criar conta em pagar.me
2. Acessar API Keys na dashboard
3. Copiar **Secret Key** de teste (`sk_test_...`) → `PAGARME_SECRET_KEY`
4. Configurar webhook: Dashboard → Webhooks → Nova URL

**Documentação oficial:** https://docs.pagar.me/

---

### Cora Pix

1. Criar conta empresarial no banco Cora
2. Acessar API Banking → Criar credenciais
3. Gerar certificado client_id + client_secret → variáveis de ambiente
4. Definir chave Pix da conta → `CORA_PIX_KEY`

**Documentação oficial:** https://developers.cora.com.br/

---

## Modo Sandbox / Demo

Se nenhum `PAGBANK_TOKEN` estiver configurado, o sistema usa o `DemoProvider` automaticamente:
- Pix retorna um código Pix fictício para testes
- Cartão sempre aprova
- Webhooks podem ser simulados manualmente

---

## Checklist de Produção

- [ ] `PAGBANK_ENV=production` (ou gateway ativo em produção)
- [ ] `NEXT_PUBLIC_SITE_URL` apontando para domínio real
- [ ] Webhook URL configurada no painel do gateway
- [ ] `PAYMENT_WEBHOOK_SECRET` configurado e seguro
- [ ] HTTPS habilitado no domínio
- [ ] Teste ponta a ponta com cartão real de baixo valor
- [ ] Testar Pix real e conferir webhook recebido
- [ ] Confirmar que estoque é baixado após pagamento
- [ ] Confirmar que pontos são creditados após pagamento
- [ ] Monitorar `payment_webhook_events` para eventos não processados
- [ ] Configurar alertas para `payments.status = "refused"` acima do threshold
- [ ] Revisar RLS do Supabase (cliente só vê seus próprios pagamentos)
- [ ] Garantir que chaves secretas NÃO estão no front-end
