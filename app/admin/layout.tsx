import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin — Maromba Club",
    template: "%s | Admin MC",
  },
  manifest: "/manifest-admin.json",
  themeColor: "#6366F1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MC Admin",
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
