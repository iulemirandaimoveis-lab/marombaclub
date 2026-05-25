"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ShoppingCart, User, Menu, X, Search, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { signOut } from "@/lib/supabase/auth";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/clube", label: "Clube" },
  { href: "/recompensas", label: "Recompensas" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.item_count());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut();
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-card"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-opacity duration-200 hover:opacity-80">
            <BrandLogo variant="client" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-black/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Buscar">
              <Search className="w-4 h-4" />
            </Button>

            <Link href="/carrinho">
              <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Conta"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User className="w-4 h-4" />
                </Button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-20 w-52 bg-surface border border-border rounded-2xl shadow-card py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/perfil"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Meu perfil
                      </Link>
                      <Link
                        href="/pedidos"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Meus pedidos
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="icon" aria-label="Entrar">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {!user && (
              <Link href="/clube" className="hidden md:block">
                <Button size="sm" className="font-bold">
                  Entrar no clube
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-black/5 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/perfil" className="flex items-center gap-2 px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-black/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4" />
                    Meu perfil
                  </Link>
                  <Link href="/pedidos" className="flex items-center gap-2 px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-black/5 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>
                    <ShoppingBag className="w-4 h-4" />
                    Meus pedidos
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm text-danger rounded-lg transition-all text-left">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="surface" size="md" className="w-full">Entrar</Button>
                  </Link>
                  <Link href="/cadastro" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="md" className="w-full font-bold">Criar conta</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
