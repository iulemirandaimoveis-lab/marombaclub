"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Package, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/catalogo", icon: Search, label: "Catálogo" },
  { href: "/carrinho", icon: ShoppingCart, label: "Carrinho", badge: true },
  { href: "/pedidos", icon: Package, label: "Pedidos" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.item_count());

  const isAdminOrDriver = pathname.startsWith("/admin") || pathname.startsWith("/entregador");
  if (isAdminOrDriver) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-5 h-5" />
                {badge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-background text-[10px] font-black flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? "text-primary" : ""}`}>
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
