import type { Metadata } from "next";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Shield,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Pagamentos" };

type PaymentEvent = {
  id: string;
  event_type: string;
  status: string;
  amount_cents: number | null;
  created_at: string;
  order_id: string | null;
  order_code: string | null;
  customer_name: string | null;
};

type PaymentStats = {
  pago: number;
  pendente: number;
  recusado: number;
  estornado: number;
};

async function getPaymentData(): Promise<{
  events: PaymentEvent[];
  stats: PaymentStats;
}> {
  try {
    const supabase = await createAdminClient();

    const [eventsRes, statsRes] = await Promise.all([
      supabase
        .from("payment_events")
        .select(`
          id, event_type, status, amount_cents, created_at,
          order_id,
          order:orders!payment_events_order_id_fkey(
            id,
            customer:profiles!orders_customer_id_fkey(name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("orders")
        .select("payment_status"),
    ]);

    const events: PaymentEvent[] = (eventsRes.data ?? []).map((e: any) => ({
      id: e.id,
      event_type: e.event_type ?? "",
      status: e.status ?? "",
      amount_cents: e.amount_cents,
      created_at: e.created_at,
      order_id: e.order_id,
      order_code: e.order_id ? `#${e.order_id.slice(0, 8).toUpperCase()}` : null,
      customer_name: e.order?.customer?.name ?? null,
    }));

    const orders = statsRes.data ?? [];
    const stats: PaymentStats = {
      pago: orders.filter((o: any) => o.payment_status === "PAGO").length,
      pendente: orders.filter((o: any) =>
        ["AGUARDANDO_PAGAMENTO", "PENDENTE"].includes(o.payment_status)
      ).length,
      recusado: orders.filter((o: any) => o.payment_status === "RECUSADO").length,
      estornado: orders.filter((o: any) => o.payment_status === "ESTORNADO").length,
    };

    return { events, stats };
  } catch {
    return { events: [], stats: { pago: 0, pendente: 0, recusado: 0, estornado: 0 } };
  }
}

const EVENT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "primary" | "warning" | "danger" | "default" | "surface"; icon: typeof CheckCircle }
> = {
  PAGO: { label: "Pago", variant: "primary", icon: CheckCircle },
  APROVADO: { label: "Aprovado", variant: "primary", icon: CheckCircle },
  PENDENTE: { label: "Pendente", variant: "warning", icon: Clock },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando", variant: "warning", icon: Clock },
  RECUSADO: { label: "Recusado", variant: "danger", icon: XCircle },
  CANCELADO: { label: "Cancelado", variant: "danger", icon: XCircle },
  ESTORNADO: { label: "Estornado", variant: "surface", icon: RotateCcw },
  CHARGEBACK: { label: "Chargeback", variant: "danger", icon: AlertTriangle },
};

function getStatusConfig(status: string) {
  return (
    EVENT_STATUS_CONFIG[status] ?? {
      label: status,
      variant: "surface" as const,
      icon: Clock,
    }
  );
}

export default async function AdminPagamentosPage() {
  const { events, stats } = await getPaymentData();

  const isPagBankSandbox =
    !process.env.PAGBANK_ENV || process.env.PAGBANK_ENV === "sandbox";

  const STAT_CARDS = [
    {
      title: "Pago",
      value: stats.pago,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "Pendente",
      value: stats.pendente,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    {
      title: "Recusado",
      value: stats.recusado,
      icon: XCircle,
      color: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/20",
    },
    {
      title: "Estornado",
      value: stats.estornado,
      icon: RotateCcw,
      color: "text-muted",
      bg: "bg-surface",
      border: "border-border",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Pagamentos</h1>
          </div>
          <p className="text-muted pl-[52px]">
            Eventos de pagamento, status e integração com PagBank.
          </p>
        </div>
        <Badge variant={isPagBankSandbox ? "warning" : "primary"}>
          <Zap className="w-3 h-3" />
          {isPagBankSandbox ? "Sandbox" : "Produção"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS.map((stat, i) => (
          <Card key={stat.title} className={`border ${stat.border}`}>
            <CardContent className="pt-6">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-4`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>
                {stat.value.toLocaleString("pt-BR")}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PagBank integration status */}
      <Card className="border-border overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Integração PagBank
            </CardTitle>
            <Badge variant={isPagBankSandbox ? "warning" : "primary"}>
              {isPagBankSandbox ? "Sandbox ativo" : "Produção ativa"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Ambiente",
                value: isPagBankSandbox ? "Sandbox (teste)" : "Produção",
                ok: !isPagBankSandbox,
                warn: isPagBankSandbox,
              },
              {
                label: "Token PagBank",
                value: process.env.PAGBANK_TOKEN
                  ? `••••${process.env.PAGBANK_TOKEN.slice(-4)}`
                  : "Não configurado",
                ok: !!process.env.PAGBANK_TOKEN,
                warn: false,
              },
              {
                label: "Webhook URL",
                value: process.env.NEXT_PUBLIC_SITE_URL
                  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/pagbank`
                  : "URL não configurada",
                ok: !!process.env.NEXT_PUBLIC_SITE_URL,
                warn: false,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-2xl bg-surface border border-border space-y-1"
              >
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {item.label}
                </p>
                <div className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : item.warn ? (
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment events table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Eventos de pagamento
            </CardTitle>
            <span className="text-xs text-muted">{events.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-foreground font-bold text-lg">Nenhum evento encontrado</p>
              <p className="text-muted text-sm mt-1">
                Os eventos de pagamento do PagBank aparecerão aqui conforme os pedidos
                forem processados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Evento", "Pedido", "Cliente", "Valor", "Status", "Data"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 first:pl-6 last:pr-6"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const cfg = getStatusConfig(event.status);
                    const StatusIcon = cfg.icon;
                    return (
                      <tr
                        key={event.id}
                        className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="pl-6 pr-3 py-3">
                          <span className="font-mono text-xs text-muted">
                            {event.event_type || event.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {event.order_code ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm text-muted">
                            {event.customer_name ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-sm font-semibold text-foreground">
                            {event.amount_cents != null
                              ? formatCurrency(event.amount_cents)
                              : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={cfg.variant}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-3 pr-6 py-3">
                          <span className="text-xs text-muted">
                            {new Date(event.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
