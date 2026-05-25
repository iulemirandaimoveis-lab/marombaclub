"use client";

import Link from "next/link";
import Image from "next/image";
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
  X,
  ArrowRightLeft,
  DollarSign,
  MapPin,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Warehouse },
  { href: "/admin/lojas", label: "Lojas", icon: Store },
  { href: "/admin/pontos-retirada", label: "Pontos Retirada", icon: MapPin },
  { href: "/admin/transferencias", label: "Transferências", icon: ArrowRightLeft },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingBag },
  { href: "/admin/comissoes", label: "Comissões", icon: DollarSign },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/clube", label: "Clube", icon: Trophy },
  { href: "/admin/recompensas", label: "Recompensas", icon: Gift },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/auditoria", label: "Auditoria", icon: Shield },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close drawer on route change (mobile)
  useEffect(() => {
    onMobileClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onMobileClose]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside
      className={cn(
        "bg-surface border-r border-border flex flex-col transition-all duration-300 h-full",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
        {!collapsed ? (
          <Link href="/" className="min-w-0">
            <Image src="/logo.png" alt="Maromba Club" width={160} height={48} className="h-7 w-auto object-contain" />
          </Link>
        ) : (
          <Link href="/">
            <Image src="/logo-mb.png" alt="MB" width={32} height={32} className="w-7 h-7 object-contain" />
          </Link>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg hidden lg:flex items-center justify-center text-muted hover:text-foreground hover:bg-white/5 transition-all ml-auto flex-shrink-0"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="w-7 h-7 rounded-lg lg:hidden flex items-center justify-center text-muted hover:text-foreground hover:bg-white/5 transition-all ml-auto flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
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
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex-shrink-0">
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

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full w-64">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}

export function AdminMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-all"
      aria-label="Abrir menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
