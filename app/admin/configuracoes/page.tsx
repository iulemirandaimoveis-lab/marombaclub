import type { Metadata } from "next";
import { Settings, Store, CreditCard, Bell, Shield, Palette, Truck } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Configurações" };

const SECTIONS = [
  {
    icon: Store,
    title: "Informações da loja",
    description: "Nome, endereço, CNPJ e contato da loja principal.",
    status: "Em breve",
  },
  {
    icon: CreditCard,
    title: "Pagamentos",
    description: "Configurar provedores de pagamento: PagBank, MercadoPago, Pagarme.",
    status: "Em breve",
  },
  {
    icon: Truck,
    title: "Entrega",
    description: "Regras de entrega, taxas, CEPs atendidos e prazos.",
    status: "Em breve",
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "E-mails transacionais, alertas de estoque e notificações push.",
    status: "Em breve",
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Autenticação de dois fatores e auditoria de acessos.",
    status: "Em breve",
  },
  {
    icon: Palette,
    title: "Personalização",
    description: "Cores, logo, banners e identidade visual da loja.",
    status: "Em breve",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Configurações</h1>
        <p className="text-muted text-sm mt-1">Gerencie as configurações da plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ icon: Icon, title, description, status }) => (
          <div key={title} className="bg-surface border border-border rounded-2xl p-5 opacity-70">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted bg-surface border border-border px-2 py-1 rounded-lg">
                {status}
              </span>
            </div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted mt-1">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
