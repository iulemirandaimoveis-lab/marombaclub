# Maromba Club MVP

MVP com Next.js App Router, TypeScript, Tailwind, catálogo mockado, base Supabase, modelagem de estoque por movimentação, pontos em ledger e placeholders de pagamento PagBank/PagSeguro.

## Requisitos

- Node 20.x
- npm 10+

## Rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAGBANK_TOKEN=
PAGBANK_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Rode em desenvolvimento:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Princípios aplicados

* Estoque controlado por `inventory_movements`.
* Pontos controlados por `loyalty_points_ledger`.
* Validação server-side com Zod.
* Cálculo de total no backend com `calculateOrderTotal`.
* Home e catálogo funcionam sem depender do Supabase.
* Pagamentos implementados inicialmente como placeholder seguro.

## Supabase

* Migration inicial: `supabase/migrations/20260518_initial_schema.sql`.
* RLS habilitado para `products`, `orders` e `loyalty_accounts`.
* Política pública: leitura de produtos ativos.
* Política privada: usuário só lê seus próprios pedidos e conta de fidelidade.
* `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no frontend.

## PagBank/PagSeguro

* `POST /api/payments/create`: valida payload com Zod e retorna status pendente.
* `POST /api/payments/webhook`: valida secret e payload.
* `payment_events` registra eventos com idempotência por `provider_event_id`.
* Não há armazenamento de dados sensíveis de cartão.

## Deploy na Vercel

1. Importar repositório.
2. Framework: Next.js.
3. Root Directory: `.`.
4. Install command: `npm install`.
5. Build command: `npm run build`.
6. Output directory: `.next`.
7. Node.js: 20.x.
8. Instalar variáveis de ambiente.
9. Fazer deploy.
10. Atualizar `NEXT_PUBLIC_SITE_URL` com a URL final da Vercel.
11. Rodar redeploy.

## Troubleshooting Vercel

* Confirme branch de produção: `main`.
* Se aparecer commit antigo, faça novo push em `main` e rode redeploy manual.
* Verifique `Root Directory = .`.
* Verifique `Framework Preset = Next.js`.
* O log deve mostrar `Detected Next.js version`.
* O build deve usar `npm install` e `npm run build`.
* O deploy final deve ficar como `Ready`.

## Próximos passos

1. Integrar Supabase Auth completo.
2. Implementar RLS por papel: admin, gerente, vendedor e cliente.
3. Criar checkout completo com PagBank.
4. Implementar webhook real de confirmação de pagamento.
5. Expandir painel admin para produtos, estoque, lojas e pedidos.
6. Criar gestão completa do Maromba Club: níveis, recompensas, campanhas e resgates.
