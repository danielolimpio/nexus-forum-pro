import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — GroupeForum.pro" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Você já está autenticado.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Falha ao entrar com Google");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            G
          </div>
          <span className="text-base font-semibold tracking-tight">
            GroupeForum<span className="text-muted-foreground">.pro</span>
          </span>
        </Link>

        <div className="surface-card p-6">
          <h1 className="mb-4 text-center text-lg font-semibold tracking-tight">
            Entrar ou Criar Conta
          </h1>
          <div className="mb-4 flex hairline rounded-md bg-surface-2 p-1 text-sm">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded py-1.5 ${mode === "signin" ? "bg-surface-1 font-medium" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded py-1.5 ${mode === "signup" ? "bg-surface-1 font-medium" : "text-muted-foreground"}`}
            >
              Criar conta
            </button>
          </div>

          <button
            onClick={onGoogle}
            className="mb-3 w-full rounded-md hairline bg-surface-1 px-3 py-2 text-sm font-medium hover:bg-surface-2"
          >
            Continuar com Google
          </button>

          <div className="my-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou e-mail <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
            {mode === "signup" && (
              <input
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3–20 caracteres, letras, números ou _"
              />
            )}
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Ao continuar, você concorda com as regras do fórum.
        </p>
      </div>
    </div>
  );
}
