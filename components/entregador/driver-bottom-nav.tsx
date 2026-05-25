"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, History, DollarSign, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/entregador/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/entregador/entregas", icon: Package, label: "Entregas" },
  { href: "/entregador/historico", icon: History, label: "Histórico" },
  { href: "/entregador/ganhos", icon: DollarSign, label: "Ganhos" },
  { href: "/entregador/perfil", icon: User, label: "Perfil" },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/entregador/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              <span
                className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-all ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span
                className={`text-[9px] font-semibold leading-none ${
                  isActive ? "text-primary" : ""
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
