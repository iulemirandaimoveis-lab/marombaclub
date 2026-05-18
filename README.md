# Maromba Club MVP

Base inicial do MVP com Next.js + TypeScript e modelagem inicial de estoque por movimentação e pontos em ledger.

## Princípios já aplicados
- Estoque por `inventory_movements`.
- Pontos por `loyalty_points_ledger`.
- Validação server-side com Zod.
- Cálculo de total no backend (`calculateOrderTotal`).

## Próximos passos
1. Integrar Supabase Auth e RLS por papel.
2. Criar fluxo completo de checkout + webhook PagBank.
3. Expandir painel admin para produtos, estoque e pedidos.
