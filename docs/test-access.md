# Maromba Club — Acessos de Teste

## URLs Principais

### App Cliente
| Rota | Descrição |
|------|-----------|
| `/` | Home do cliente |
| `/catalogo` | Catálogo de produtos |
| `/produto/[slug]` | Página de produto |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Checkout (requer login) |
| `/pedidos` | Histórico de pedidos (requer login) |
| `/pedidos/[id]` | Detalhes do pedido |
| `/clube` | Clube de fidelidade |
| `/recompensas` | Recompensas disponíveis |
| `/perfil` | Perfil do cliente (requer login) |
| `/login` | Login cliente |
| `/cadastro` | Cadastro cliente |

### App Admin
| Rota | Descrição |
|------|-----------|
| `/admin/login` | Login admin |
| `/admin` | Dashboard |
| `/admin/pedidos` | Pedidos |
| `/admin/produtos` | Produtos |
| `/admin/estoque` | Estoque |
| `/admin/lojas` | Lojas |
| `/admin/pontos-retirada` | Pontos de retirada |
| `/admin/transferencias` | Transferências de estoque |
| `/admin/entregas` | Entregas |
| `/admin/entregadores` | Entregadores |
| `/admin/clientes` | Clientes |
| `/admin/pagamentos` | Pagamentos |
| `/admin/clube` | Clube admin |
| `/admin/recompensas` | Recompensas admin |
| `/admin/campanhas` | Campanhas |
| `/admin/cupons` | Cupons |
| `/admin/comissoes` | Comissões |
| `/admin/relatorios` | Relatórios |
| `/admin/auditoria` | Auditoria |
| `/admin/configuracoes` | Configurações |

### App Entregador
| Rota | Descrição |
|------|-----------|
| `/entregador/login` | Login entregador |
| `/entregador` | Redireciona para dashboard |
| `/entregador/dashboard` | Dashboard do entregador |
| `/entregador/entregas` | Lista de entregas ativas |
| `/entregador/entregas/[id]` | Detalhes da entrega |
| `/entregador/historico` | Histórico de entregas |
| `/entregador/ganhos` | Ganhos |
| `/entregador/perfil` | Perfil do entregador |

---

## Usuários de Teste

> **Aviso:** Não use senhas reais de produção aqui.
> Para criar usuários de teste, rode: `npm run seed` (ver `scripts/seed.ts`)

### Cliente Teste
```
email: cliente@teste.marombaclub.com
senha: Teste@123!
papel: customer
```

### Admin Teste
```
email: admin@teste.marombaclub.com
senha: Admin@123!
papel: admin_global
loja: Loja Principal (seed)
```

### Entregador Teste
```
email: entregador@teste.marombaclub.com
senha: Driver@123!
papel: entregador
veículo: Moto (seed)
```

---

## Controle de Acesso por Papel

| Papel | Acesso |
|-------|--------|
| `customer` | Rotas cliente: `/`, `/catalogo`, `/carrinho`, `/pedidos`, `/perfil` |
| `admin_global` | Todas as rotas `/admin/**` |
| `store_manager` | Rotas `/admin/**` + `/entregador/**` |
| `seller` | Rotas `/admin/**` (módulos limitados) |
| `financeiro` | Rotas `/admin/**` (módulos financeiros) |
| `estoque` | Rotas `/admin/**` (módulos de estoque) |
| `entregador` | Rotas `/entregador/**` |

### Proteções de roteamento
- Usuário não autenticado em `/admin/*` → redireciona para `/admin/login`
- Usuário não autenticado em `/entregador/*` → redireciona para `/entregador/login`
- Cliente tentando `/admin` → redireciona para `/`
- Admin tentando `/entregador` → **permitido** (admin pode ver painel de entregador)
- Entregador tentando `/admin` → redireciona para `/`

---

## Viewports para Testes de Responsividade

| Dispositivo | Largura | Altura |
|-------------|---------|--------|
| iPhone SE | 375px | 667px |
| iPhone 13/14 | 390px | 844px |
| Android médio | 360px | 800px |
| iPad | 768px | 1024px |
| Desktop | 1440px | 900px |
