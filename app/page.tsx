import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ color: "#00FF66", fontSize: 48, margin: 0 }}>MAROMBA CLUB</h1>
      <p>O clube onde cada compra vira evolução.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/catalogo">Comprar agora</Link>
        <Link href="/clube">Entrar no clube</Link>
      </div>
    </main>
  );
}
