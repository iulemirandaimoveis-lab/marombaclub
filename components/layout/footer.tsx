import Link from "next/link";
import { Zap, Camera, Play, MessageCircle } from "lucide-react";

const footerLinks = {
  loja: [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/catalogo?category=proteinas", label: "Proteínas" },
    { href: "/catalogo?category=creatina", label: "Creatina" },
    { href: "/catalogo?category=pre-treino", label: "Pré-treino" },
  ],
  clube: [
    { href: "/clube", label: "O Clube" },
    { href: "/recompensas", label: "Recompensas" },
    { href: "/minha-conta/pontos", label: "Meus Pontos" },
    { href: "/minha-conta/indicacoes", label: "Indicações" },
  ],
  empresa: [
    { href: "/sobre", label: "Sobre" },
    { href: "/lojas", label: "Lojas" },
    { href: "/blog", label: "Blog" },
    { href: "/contato", label: "Contato" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-neon-sm">
                <Zap className="w-5 h-5 text-background fill-background" />
              </div>
              <span className="font-black text-xl tracking-tight">
                MAROMBA<span className="text-primary">CLUB</span>
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              O clube onde cada compra vira evolução. Suplementos premium, fidelidade
              gamificada e comunidade fitness.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-all duration-200"
                aria-label="Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-all duration-200"
                aria-label="Youtube"
              >
                <Play className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/40 transition-all duration-200"
                aria-label="Twitter"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted mb-4">Loja</h4>
            <ul className="space-y-3">
              {footerLinks.loja.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted mb-4">Clube</h4>
            <ul className="space-y-3">
              {footerLinks.clube.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} Maromba Club. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-muted text-sm hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-muted text-sm hover:text-primary transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
