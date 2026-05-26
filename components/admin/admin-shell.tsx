"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AdminSidebar, AdminMenuButton } from "@/components/admin/admin-sidebar";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-surface flex-shrink-0">
          <AdminMenuButton onClick={() => setMobileOpen(true)} />
          <BrandLogo variant="admin" />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
