"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/supabase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 border border-border shadow-card">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="Maromba Club" width={200} height={64} className="h-16 w-auto" priority />
            </div>
            <h1 className="text-2xl font-black text-foreground">Recuperar senha</h1>
            <p className="text-muted text-sm mt-2">
              {sent
                ? "Verifique sua caixa de entrada"
                : "Digite seu e-mail para receber o link de recuperação"}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-foreground font-bold">E-mail enviado!</p>
              <p className="text-muted text-sm">
                Se uma conta existir para <strong>{email}</strong>, você receberá um link para redefinir sua senha em breve. Verifique também o spam.
              </p>
              <Link href="/login">
                <Button variant="surface" className="w-full mt-4">Voltar ao login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1.5 block">E-mail</label>
                <Input
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>
              )}
              <Button type="submit" size="lg" className="w-full font-black shadow-neon mt-2" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
              <p className="text-center text-sm text-muted mt-4">
                Lembrou a senha?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">Entrar</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
