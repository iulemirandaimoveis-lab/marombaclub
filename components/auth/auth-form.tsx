"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/supabase/auth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nome obrigatório"),
  password_confirm: z.string(),
}).refine((d) => d.password === d.password_confirm, {
  message: "As senhas não coincidem",
  path: ["password_confirm"],
});

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

export function AuthForm({ mode, variant = "customer" }: { mode: "login" | "register"; variant?: "customer" | "driver" | "admin" }) {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginInput | RegisterInput) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isLogin) {
        const result = await signIn(data.email, data.password);
        const { createClient } = await import("@/lib/supabase/client");
        const sb = createClient();
        const { data: profile } = await sb
          .from("profiles")
          .select("role")
          .eq("id", result.user!.id)
          .single() as { data: { role: string } | null };
        const adminRoles = ["admin_global", "store_manager", "seller", "financeiro", "estoque"];
        const redirect = new URLSearchParams(window.location.search).get("redirect");
        if (profile?.role === "entregador") {
          window.location.href = redirect ?? "/entregador/dashboard";
        } else if (profile && adminRoles.includes(profile.role)) {
          window.location.href = redirect ?? "/admin";
        } else {
          window.location.href = redirect ?? "/";
        }
      } else {
        const d = data as RegisterInput;
        await signUp(d.email, d.password, d.name);
        setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      if (raw.includes("Invalid login credentials") || raw.includes("invalid_credentials")) {
        setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      } else if (raw.includes("Email not confirmed") || raw.includes("email_not_confirmed")) {
        setError("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (ou spam).");
      } else if (raw.includes("rate limit") || raw.includes("over_email_send_rate_limit")) {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (raw.includes("User already registered")) {
        setError("Este e-mail já está cadastrado. Faça login.");
      } else {
        setError(raw || "Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 border border-border shadow-card">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Maromba Club"
                width={600}
                height={404}
                className="h-16 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-foreground">
              {isLogin ? "Bem-vindo de volta" : "Criar conta grátis"}
            </h1>
            <p className="text-muted text-sm mt-2">
              {isLogin
                ? "Entre na sua conta Maromba Club"
                : "Junte-se ao maior clube fitness do Brasil"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs text-muted mb-1.5 block">Nome completo</label>
                <Input
                  {...register("name" as keyof (LoginInput & RegisterInput))}
                  icon={<User className="w-4 h-4" />}
                  placeholder="Seu nome"
                  className="h-11"
                />
                {(errors as { name?: { message?: string } }).name && (
                  <p className="text-danger text-xs mt-1">{(errors as { name?: { message?: string } }).name?.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs text-muted mb-1.5 block">E-mail</label>
              <Input
                {...register("email")}
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="seu@email.com"
                className="h-11"
              />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs text-muted mb-1.5 block">Senha</label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPwd ? "text" : "password"}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs text-muted mb-1.5 block">Confirmar senha</label>
                <Input
                  {...register("password_confirm" as keyof (LoginInput & RegisterInput))}
                  type={showPwd ? "text" : "password"}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="••••••••"
                  className="h-11"
                />
                {(errors as { password_confirm?: { message?: string } }).password_confirm && (
                  <p className="text-danger text-xs mt-1">
                    {(errors as { password_confirm?: { message?: string } }).password_confirm?.message}
                  </p>
                )}
              </div>
            )}

            {isLogin && variant === "customer" && (
              <div className="flex justify-end">
                <Link href="/esqueceu-senha" className="text-xs text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
            )}

            {error && (
              <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-success text-sm bg-success/10 border border-success/20 rounded-xl px-4 py-3">{success}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full font-black shadow-neon mt-2"
              disabled={loading}
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          {variant === "customer" && (
            <p className="text-center text-sm text-muted mt-6">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <Link
                href={isLogin ? "/cadastro" : "/login"}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Cadastre-se grátis" : "Entrar"}
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
