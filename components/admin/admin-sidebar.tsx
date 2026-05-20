"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Store,
  ShoppingBag,
  Users,
  Trophy,
  Gift,
  Megaphone,
  Tag,
  BarChart3,
  CreditCard,
  Shield,
  Zap,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Warehouse },
  { href: "/admin/lojas", label: "Lojas", icon: Store },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingBag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/clube", label: "Clube", icon: Trophy },
  { href: "/admin/recompensas", label: "Recompensas", icon: Gift },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/auditoria", label: "Auditoria", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border flex flex-col transition-all duration-300 sticky top-0 h-screen z-40",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background fill-background" />
            </div>
            <span className="font-black text-sm">
              MAROMBA<span className="text-primary">CLUB</span>
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/5 transition-all ml-auto"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase text-muted/60 tracking-widest px-3 mb-2">
            Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted hover:text-foreground hover:bg-white/5",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-primary")} />
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted hover:text-foreground hover:bg-white/5 transition-all",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && "Voltar ao site"}
        </Link>
      </div>
    </aside>
  );
}
