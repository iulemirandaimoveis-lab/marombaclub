"use client";

import { useState, useMemo } from "react";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  ShoppingBag,
  TrendingUp,
  Zap,
  Crown,
  ChevronDown,
  Filter,
  Trophy,
  Star,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { AdminCustomer } from "@/lib/data/admin";

interface Props {
  customers: AdminCustomer[];
}

type TierFilter = "ALL" | "BRONZE" | "SILVER" | "GOLD" | "BLACK" | "BEAST_MODE";

const TIER_LABELS: Record<string, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  BLACK: "Black",
  BEAST_MODE: "Beast Mode",
};

const ROLE_LABELS: Record<string, string> = {
  customer: "Cliente",
  admin: "Admin",
  staff: "Staff",
};

const TIER_FILTER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: "ALL", label: "Todos os tiers" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "BLACK", label: "Black" },
  { value: "BEAST_MODE", label: "Beast Mode" },
];

function getTierBadge(tier: string | null) {
  if (!tier) return <Badge variant="default">—</Badge>;

  if (tier === "BLACK") {
    return (
      <Badge className="bg-gray-900 text-white border-gray-700">
        <Crown className="w-3 h-3" />
        Black
      </Badge>
    );
  }

  if (tier === "BEAST_MODE") {
    return (
      <Badge variant="danger">
        <Zap className="w-3 h-3" />
        Beast Mode
      </Badge>
    );
  }

  const variantMap: Record<string, "default" | "surface" | "primary"> = {
    BRONZE: "default",
    SILVER: "surface",
    GOLD: "primary",
  };

  const iconMap: Record<string, React.ElementType> = {
    BRONZE: Trophy,
    SILVER: Star,
    GOLD: Star,
  };

  const TierIcon = iconMap[tier];

  return (
    <Badge variant={variantMap[tier] ?? "default"}>
      {TierIcon && <TierIcon className="w-3 h-3" />}
      {TIER_LABELS[tier] ?? tier}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function AdminCustomersClient({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("ALL");
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);

  // Stats
  const totalCustomers = customers.length;
  const withOrders = customers.filter((c) => c.total_orders > 0).length;
  const avgSpend =
    withOrders > 0
      ? Math.round(
          customers
            .filter((c) => c.total_orders > 0)
            .reduce((s, c) => s + c.total_spent_cents, 0) / withOrders
        )
      : 0;

  const STATS = [
    {
      label: "Total de clientes",
      value: totalCustomers.toLocaleString("pt-BR"),
      color: "text-foreground",
      iconColor: "text-muted",
      bg: "bg-white/5",
      icon: Users,
    },
    {
      label: "Com pedidos",
      value: withOrders.toLocaleString("pt-BR"),
      color: "text-primary",
      iconColor: "text-primary",
      bg: "bg-primary/10",
      icon: ShoppingBag,
    },
    {
      label: "Ticket médio",
      value: formatCurrency(avgSpend),
      color: "text-warning",
      iconColor: "text-warning",
      bg: "bg-warning/10",
      icon: TrendingUp,
    },
  ];

  // Filtered customers
  const filtered = useMemo(() => {
    let list = customers;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name ?? "").toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (tierFilter !== "ALL") {
      list = list.filter((c) => c.loyalty_tier === tierFilter);
    }

    return list;
  }, [customers, search, tierFilter]);

  const activeTierLabel =
    TIER_FILTER_OPTIONS.find((o) => o.value === tierFilter)?.label ?? "Todos";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Clientes</h1>
          <p className="text-muted text-sm mt-0.5">
            Gerencie a base de clientes e o programa de fidelidade
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Card className="border-border">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
      >
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="flex-1">
                Base de Clientes
                <span className="ml-2 text-sm font-normal text-muted">
                  ({filtered.length})
                </span>
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="w-full sm:w-64">
                  <Input
                    icon={<Search className="w-4 h-4" />}
                    placeholder="Buscar por nome ou email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Tier filter */}
                <div className="relative">
                  <button
                    onClick={() => setTierDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl bg-surface border border-border text-sm text-foreground hover:border-primary/40 transition-all duration-200 whitespace-nowrap"
                  >
                    <Filter className="w-3.5 h-3.5 text-muted" />
                    {activeTierLabel}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                        tierDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {tierDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                      >
                        {TIER_FILTER_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTierFilter(opt.value);
                              setTierDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                              tierFilter === opt.value
                                ? "text-primary bg-primary/10"
                                : "text-foreground hover:bg-white/5"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 px-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-muted" />
                </div>
                <p className="text-foreground font-bold">Nenhum cliente encontrado</p>
                <p className="text-muted text-sm mt-1">
                  Tente outros termos de busca ou ajuste os filtros.
                </p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Cliente
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Telefone
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Perfil
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Pedidos
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Total Gasto
                      </th>
                      <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Tier
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                        Pontos
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Membro desde
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((customer, i) => (
                        <CustomerRow key={customer.id} customer={customer} index={i} />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function CustomerRow({
  customer,
  index,
}: {
  customer: AdminCustomer;
  index: number;
}) {
  const initials = customer.name
    ? customer.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : customer.email[0].toUpperCase();

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="border-b border-border/60 last:border-0 hover:bg-white/[0.025] transition-colors"
    >
      {/* Name / Email */}
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-primary">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight truncate max-w-[180px]">
              {customer.name ?? <span className="text-muted italic font-normal">Sem nome</span>}
            </p>
            <p className="text-xs text-muted truncate max-w-[180px]">{customer.email}</p>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-3.5">
        <span className="text-sm text-muted">
          {customer.phone ?? <span className="text-muted/40 italic">—</span>}
        </span>
      </td>

      {/* Role */}
      <td className="px-4 py-3.5">
        <Badge
          variant={
            customer.role === "admin"
              ? "danger"
              : customer.role === "staff"
              ? "warning"
              : "surface"
          }
        >
          {ROLE_LABELS[customer.role] ?? customer.role}
        </Badge>
      </td>

      {/* Orders */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {customer.total_orders}
        </span>
      </td>

      {/* Total spent */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {customer.total_spent_cents > 0
            ? formatCurrency(customer.total_spent_cents)
            : <span className="text-muted font-normal">—</span>}
        </span>
      </td>

      {/* Tier */}
      <td className="px-4 py-3.5 text-center">
        {getTierBadge(customer.loyalty_tier)}
      </td>

      {/* Points */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-sm font-semibold text-primary tabular-nums">
          {customer.total_points.toLocaleString("pt-BR")}
        </span>
        <span className="text-xs text-muted ml-1">pts</span>
      </td>

      {/* Member since */}
      <td className="px-6 py-3.5">
        <span className="text-sm text-muted">{formatDate(customer.created_at)}</span>
      </td>
    </motion.tr>
  );
}
