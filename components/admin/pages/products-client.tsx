"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Star,
  ImageOff,
  Loader2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type { AdminProduct } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleProductActive, toggleProductFeatured, toggleProductBestSeller } from "@/app/actions/products";

interface AdminProductsClientProps {
  products: AdminProduct[];
}

export function AdminProductsClient({ products }: AdminProductsClientProps) {
  const [search, setSearch] = useState("");
  const [localProducts, setLocalProducts] = useState(products);

  const filtered = localProducts.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
  });

  const totalProducts = localProducts.length;
  const activeProducts = localProducts.filter((p) => p.is_active).length;
  const clubExclusive = localProducts.filter((p) => p.is_club_exclusive).length;
  const inactiveProducts = localProducts.filter((p) => !p.is_active).length;

  const handleToggleActive = async (id: string, current: boolean) => {
    setLocalProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
    );
    try {
      await toggleProductActive(id, !current);
    } catch {
      // Revert on error
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: current } : p))
      );
    }
  };

  const STATS = [
    {
      label: "Total de produtos",
      value: totalProducts,
      color: "text-foreground",
      bg: "bg-white/5",
      icon: Package,
      iconColor: "text-muted",
    },
    {
      label: "Ativos",
      value: activeProducts,
      color: "text-primary",
      bg: "bg-primary/10",
      icon: Eye,
      iconColor: "text-primary",
    },
    {
      label: "Exclusivo Clube",
      value: clubExclusive,
      color: "text-warning",
      bg: "bg-warning/10",
      icon: Star,
      iconColor: "text-warning",
    },
    {
      label: "Inativos",
      value: inactiveProducts,
      color: "text-danger",
      bg: "bg-danger/10",
      icon: EyeOff,
      iconColor: "text-danger",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-foreground">Produtos</h1>
          <p className="text-muted mt-1">
            Gerencie o catálogo de suplementos da plataforma.
          </p>
        </div>
        <Button asChild size="md">
          <a href="/admin/produtos/novo">
            <Plus className="w-4 h-4" />
            Novo produto
          </a>
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Card className="border-border">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
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

      {/* Search & Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="flex-1">Catálogo</CardTitle>
              <div className="w-full sm:w-72">
                <Input
                  icon={<Search className="w-4 h-4" />}
                  placeholder="Buscar por nome ou marca…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <EmptyState search={search} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 w-14">
                        Img
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Produto
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Categoria
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Preço
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Custo
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Estoque
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Status
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((product, i) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          index={i}
                          onToggleActive={handleToggleActive}
                        />
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

interface ProductRowProps {
  product: AdminProduct;
  index: number;
  onToggleActive: (id: string, current: boolean) => Promise<void>;
}

function ProductRow({ product, index, onToggleActive }: ProductRowProps) {
  const [isPending, startTransition] = useTransition();
  const isLowStock = product.total_inventory < 10;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="border-b border-border/60 hover:bg-white/[0.02] transition-colors group"
    >
      {/* Image */}
      <td className="px-6 py-3">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageOff className="w-4 h-4 text-muted" />
          )}
        </div>
      </td>

      {/* Name / Brand */}
      <td className="px-3 py-3">
        <p className="text-sm font-bold text-foreground leading-tight line-clamp-1">
          {product.name}
        </p>
        <p className="text-xs text-muted mt-0.5">{product.brand}</p>
      </td>

      {/* Category */}
      <td className="px-3 py-3">
        {product.category ? (
          <span className="text-sm text-muted">{product.category.name}</span>
        ) : (
          <span className="text-xs text-muted/50 italic">—</span>
        )}
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-right">
        <span className="text-sm font-bold text-foreground">
          {formatCurrency(product.price_cents)}
        </span>
      </td>

      {/* Cost */}
      <td className="px-3 py-3 text-right">
        {product.cost_cents != null ? (
          <span className="text-sm text-muted">
            {formatCurrency(product.cost_cents)}
          </span>
        ) : (
          <span className="text-xs text-muted/50 italic">—</span>
        )}
      </td>

      {/* Stock */}
      <td className="px-3 py-3 text-right">
        <span
          className={`text-sm font-bold ${
            isLowStock ? "text-danger" : "text-foreground"
          }`}
        >
          {product.total_inventory}
        </span>
        {isLowStock && (
          <p className="text-[10px] text-danger mt-0.5">Baixo</p>
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1">
          <Badge variant={product.is_active ? "primary" : "danger"}>
            {product.is_active ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Ativo
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-danger inline-block" />
                Inativo
              </>
            )}
          </Badge>
          {product.is_best_seller && (
            <Badge variant="primary">
              <TrendingUp className="w-3 h-3" />
              Mais Vendido
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="primary">
              <Sparkles className="w-3 h-3" />
              Destaque
            </Badge>
          )}
          {product.is_club_exclusive && (
            <Badge variant="warning">
              <Star className="w-3 h-3" />
              Exclusivo Clube
            </Badge>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            title={product.is_featured ? "Remover destaque" : "Marcar como destaque"}
            disabled={isPending}
            onClick={() => startTransition(() => toggleProductFeatured(product.id, !product.is_featured))}
          >
            <Sparkles className={`w-4 h-4 ${product.is_featured ? "text-primary" : "text-muted"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title={product.is_best_seller ? "Remover mais vendido" : "Marcar como mais vendido"}
            disabled={isPending}
            onClick={() => startTransition(() => toggleProductBestSeller(product.id, !product.is_best_seller))}
          >
            <TrendingUp className={`w-4 h-4 ${product.is_best_seller ? "text-primary" : "text-muted"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title={product.is_active ? "Desativar produto" : "Ativar produto"}
            disabled={isPending}
            onClick={() => startTransition(() => onToggleActive(product.id, product.is_active))}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted" />
            ) : product.is_active ? (
              <ToggleRight className="w-4 h-4 text-primary" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-muted" />
            )}
          </Button>
          <Button variant="ghost" size="icon-sm" title="Editar produto" asChild>
            <a href={`/admin/produtos/${product.id}`}>
              <Edit className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
            </a>
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
        <Package className="w-7 h-7 text-muted" />
      </div>
      {search ? (
        <>
          <p className="text-foreground font-bold text-lg">Nenhum produto encontrado</p>
          <p className="text-muted text-sm mt-1">
            Nenhum resultado para &ldquo;{search}&rdquo;. Tente outro termo.
          </p>
        </>
      ) : (
        <>
          <p className="text-foreground font-bold text-lg">Catálogo vazio</p>
          <p className="text-muted text-sm mt-1">
            Adicione o primeiro produto ao catálogo.
          </p>
          <Button asChild size="md" className="mt-6">
            <a href="/admin/produtos/novo">
              <Plus className="w-4 h-4" />
              Novo produto
            </a>
          </Button>
        </>
      )}
    </motion.div>
  );
}
