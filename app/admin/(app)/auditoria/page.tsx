import type { Metadata } from "next";
import {
  Shield,
  Activity,
  User,
  Clock,
  FileText,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin — Auditoria" };

type AuditLog = {
  id: string;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string | null;
  performed_by_name: string | null;
  created_at: string;
  ip_address: string | null;
};

async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id, action, table_name, record_id,
        old_values, new_values, user_id,
        ip_address, created_at,
        profile:profiles!audit_logs_user_id_fkey(name)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return [];

    return data.map((log: any) => ({
      id: log.id,
      action: log.action ?? "",
      table_name: log.table_name ?? null,
      record_id: log.record_id ?? null,
      old_values: log.old_values ?? null,
      new_values: log.new_values ?? null,
      performed_by: log.user_id ?? null,
      performed_by_name: log.profile?.name ?? null,
      ip_address: log.ip_address ?? null,
      created_at: log.created_at,
    }));
  } catch {
    return [];
  }
}

const ACTION_CONFIG: Record<
  string,
  { label: string; variant: "primary" | "warning" | "danger" | "default" | "surface"; color: string }
> = {
  INSERT: { label: "Criação", variant: "primary", color: "text-primary" },
  CREATE: { label: "Criação", variant: "primary", color: "text-primary" },
  UPDATE: { label: "Atualização", variant: "warning", color: "text-warning" },
  DELETE: { label: "Exclusão", variant: "danger", color: "text-danger" },
  LOGIN: { label: "Login", variant: "default", color: "text-foreground" },
  LOGOUT: { label: "Logout", variant: "surface", color: "text-muted" },
  EXPORT: { label: "Exportação", variant: "warning", color: "text-warning" },
};

function getActionConfig(action: string) {
  return (
    ACTION_CONFIG[action.toUpperCase()] ?? {
      label: action,
      variant: "surface" as const,
      color: "text-muted",
    }
  );
}

function formatDetails(log: AuditLog): string {
  const parts: string[] = [];
  if (log.table_name) parts.push(`Tabela: ${log.table_name}`);
  if (log.record_id) parts.push(`ID: ${log.record_id.slice(0, 8)}`);
  if (log.new_values && Object.keys(log.new_values).length > 0) {
    const keys = Object.keys(log.new_values).slice(0, 3);
    parts.push(`Campos: ${keys.join(", ")}`);
  }
  return parts.join(" · ") || "—";
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  border,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <Card className={`border ${border}`}>
      <CardContent className="pt-6">
        <div
          className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        <p className="text-sm font-semibold text-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminAuditoriaPage() {
  const logs = await getAuditLogs();

  const actionCounts = logs.reduce<Record<string, number>>((acc, log) => {
    const key = log.action.toUpperCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const totalCreations =
    (actionCounts["INSERT"] ?? 0) + (actionCounts["CREATE"] ?? 0);
  const totalUpdates = actionCounts["UPDATE"] ?? 0;
  const totalDeletions = actionCounts["DELETE"] ?? 0;
  const totalLogins =
    (actionCounts["LOGIN"] ?? 0) + (actionCounts["LOGOUT"] ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Auditoria</h1>
          </div>
          <p className="text-muted pl-[52px]">
            Registro completo de ações realizadas no sistema.
          </p>
        </div>
        <Badge variant="surface">
          <Lock className="w-3 h-3" />
          {logs.length} registros
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Criações"
          value={totalCreations}
          icon={Activity}
          color="text-primary"
          bg="bg-primary/10"
          border="border-primary/20"
        />
        <StatCard
          title="Atualizações"
          value={totalUpdates}
          icon={FileText}
          color="text-warning"
          bg="bg-warning/10"
          border="border-warning/20"
        />
        <StatCard
          title="Exclusões"
          value={totalDeletions}
          icon={AlertTriangle}
          color="text-danger"
          bg="bg-danger/10"
          border="border-danger/20"
        />
        <StatCard
          title="Logins/Sessões"
          value={totalLogins}
          icon={User}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
      </div>

      {/* Security banner */}
      <Card className="border-border overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Registro de auditoria ativo</h3>
              <p className="text-muted text-sm mt-0.5">
                Todas as operações críticas — criação, atualização e exclusão de registros —
                são registradas automaticamente com timestamp, usuário responsável e dados
                alterados, garantindo rastreabilidade completa.
              </p>
            </div>
            <Badge variant="primary" className="flex-shrink-0 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Log de ações
            </CardTitle>
            <span className="text-xs text-muted">Últimos {logs.length} eventos</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-foreground font-bold text-lg">Nenhum log registrado</p>
              <p className="text-muted text-sm mt-1 max-w-sm">
                Os logs de auditoria serão registrados conforme os usuários realizam ações
                no sistema. A tabela{" "}
                <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">
                  audit_logs
                </code>{" "}
                pode estar vazia ou ainda não foi criada.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Timestamp", "Ação", "Usuário", "Detalhes", "IP"].map((h) => (
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
                  {logs.map((log) => {
                    const cfg = getActionConfig(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="pl-6 pr-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {new Date(log.created_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                              <p className="text-[11px] text-muted">
                                {new Date(log.created_at).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-3 py-3">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </td>

                        {/* User */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {log.performed_by_name ?? "Sistema"}
                              </p>
                              {log.performed_by && (
                                <p className="text-[11px] text-muted font-mono">
                                  {log.performed_by.slice(0, 8)}…
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-3 py-3 max-w-[280px]">
                          <p className="text-xs text-muted truncate">
                            {formatDetails(log)}
                          </p>
                        </td>

                        {/* IP */}
                        <td className="px-3 pr-6 py-3">
                          <span className="font-mono text-xs text-muted">
                            {log.ip_address ?? "—"}
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
