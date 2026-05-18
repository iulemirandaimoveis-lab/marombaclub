# Maromba Club MVP

MVP com Next.js App Router, TypeScript, Tailwind, catálogo mockado, base Supabase e placeholders de pagamento PagBank.

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

## Supabase
- Migration inicial: `supabase/migrations/20260518_initial_schema.sql`.
- RLS habilitado para `products`, `orders` e `loyalty_accounts`.
- Política pública: leitura de produtos ativos.
- Política privada: usuário só lê seus próprios pedidos/conta de fidelidade.

## PagBank/PagSeguro (placeholder)
- `POST /api/payments/create`: valida payload com Zod e retorna status pendente.
- `POST /api/payments/webhook`: valida secret + payload, persiste `payment_events` com idempotência por `provider_event_id`.
- Não há armazenamento de dados sensíveis de cartão.

## Deploy na Vercel
1. Importar repositório.
2. Framework: Next.js.
3. Root Directory: `.`.
4. Build command: `npm run build`.
5. Instalar variáveis de ambiente acima.
6. Deploy.
7. Atualizar `NEXT_PUBLIC_SITE_URL` com URL final da Vercel.
8. Redeploy.

## Troubleshooting Vercel (produção)
- Confirme branch de produção: `main`.
- Se aparecer commit antigo (ex.: `fd60244`), faça novo push em `main` e redeploy manual.
- Verifique `Root Directory = .` e `Framework Preset = Next.js`.
- Build deve usar `npm install` e `npm run build` com Node 20.x.
