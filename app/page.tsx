import Link from "next/link";
import { HomeCatalog } from "@/components/home-catalog";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <section className="glass rounded-2xl p-8 md:p-12">
        <p className="text-neon text-sm tracking-[0.2em]">PREMIUM FITNESS CLUB</p>
        <h1 className="mt-2 text-4xl font-extrabold md:text-6xl">MAROMBA CLUB</h1>
        <p className="mt-4 max-w-xl text-zinc-300">O clube onde cada compra vira evolução.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-neon px-5 py-3 font-semibold text-black" href="/catalogo">Comprar agora</Link>
          <Link className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold" href="/clube">Entrar no clube</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Catálogo em destaque</h2>
        <HomeCatalog />
      </section>

      <section className="glass mt-12 rounded-2xl p-8">
        <h2 className="text-2xl font-bold">Clube de Fidelidade</h2>
        <p className="mt-2 text-zinc-300">Ganhe 1 ponto por R$ 1, suba de nível e troque por recompensas exclusivas.</p>
      </section>
    </main>
  );
}
