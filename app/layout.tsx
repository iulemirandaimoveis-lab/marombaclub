import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#050505", color: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
