"use client";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/supabase/auth";

export function DriverShellHeader() {
  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border flex-shrink-0">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <BrandLogo variant="driver" />
        <button
          onClick={handleLogout}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
