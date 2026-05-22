"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AdminSidebar, AdminMenuButton } from "@/components/admin/admin-sidebar";
import { Zap } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-surface flex-shrink-0">
          <AdminMenuButton onClick={() => setMobileOpen(true)} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-background fill-background" />
            </div>
            <span className="font-black text-sm">
              MAROMBA<span className="text-primary">CLUB</span>
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
