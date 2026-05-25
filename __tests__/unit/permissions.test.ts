/**
 * Unit tests — Role-based access control
 * Run: npx jest __tests__/unit/permissions.test.ts
 */

type Role =
  | "admin_global"
  | "store_manager"
  | "seller"
  | "customer"
  | "entregador"
  | "financeiro"
  | "estoque";

const ADMIN_ROLES: Role[] = ["admin_global", "store_manager", "seller", "financeiro", "estoque"];
const DRIVER_ROLES: Role[] = ["entregador", "admin_global", "store_manager"];
const CUSTOMER_PROTECTED = ["/checkout", "/perfil", "/pedidos"];

function canAccessAdmin(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

function canAccessDriver(role: Role): boolean {
  return DRIVER_ROLES.includes(role);
}

function canAccessCustomerProtected(role: Role | null): boolean {
  return role !== null;
}

function getLoginRedirect(role: Role): string {
  if (role === "entregador") return "/entregador/dashboard";
  if (ADMIN_ROLES.includes(role)) return "/admin";
  return "/";
}

describe("RBAC — Admin access", () => {
  it("admin_global can access /admin", () => {
    expect(canAccessAdmin("admin_global")).toBe(true);
  });

  it("store_manager can access /admin", () => {
    expect(canAccessAdmin("store_manager")).toBe(true);
  });

  it("seller can access /admin", () => {
    expect(canAccessAdmin("seller")).toBe(true);
  });

  it("financeiro can access /admin", () => {
    expect(canAccessAdmin("financeiro")).toBe(true);
  });

  it("estoque can access /admin", () => {
    expect(canAccessAdmin("estoque")).toBe(true);
  });

  it("customer cannot access /admin", () => {
    expect(canAccessAdmin("customer")).toBe(false);
  });

  it("entregador cannot access /admin", () => {
    expect(canAccessAdmin("entregador")).toBe(false);
  });
});

describe("RBAC — Driver access", () => {
  it("entregador can access /entregador", () => {
    expect(canAccessDriver("entregador")).toBe(true);
  });

  it("admin_global can access /entregador", () => {
    expect(canAccessDriver("admin_global")).toBe(true);
  });

  it("store_manager can access /entregador", () => {
    expect(canAccessDriver("store_manager")).toBe(true);
  });

  it("customer cannot access /entregador", () => {
    expect(canAccessDriver("customer")).toBe(false);
  });

  it("seller cannot access /entregador", () => {
    expect(canAccessDriver("seller")).toBe(false);
  });
});

describe("RBAC — Login redirect", () => {
  it("entregador redirects to /entregador/dashboard after login", () => {
    expect(getLoginRedirect("entregador")).toBe("/entregador/dashboard");
  });

  it("admin_global redirects to /admin after login", () => {
    expect(getLoginRedirect("admin_global")).toBe("/admin");
  });

  it("store_manager redirects to /admin after login", () => {
    expect(getLoginRedirect("store_manager")).toBe("/admin");
  });

  it("customer redirects to / after login", () => {
    expect(getLoginRedirect("customer")).toBe("/");
  });

  it("seller redirects to /admin after login", () => {
    expect(getLoginRedirect("seller")).toBe("/admin");
  });
});

describe("RBAC — Customer protected routes", () => {
  it("authenticated users can access /checkout", () => {
    expect(canAccessCustomerProtected("customer")).toBe(true);
  });

  it("unauthenticated users cannot access /checkout", () => {
    expect(canAccessCustomerProtected(null)).toBe(false);
  });

  it("customer protected routes list is correct", () => {
    expect(CUSTOMER_PROTECTED).toContain("/checkout");
    expect(CUSTOMER_PROTECTED).toContain("/perfil");
    expect(CUSTOMER_PROTECTED).toContain("/pedidos");
  });
});
