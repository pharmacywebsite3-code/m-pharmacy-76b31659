import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Mail, Lock as LockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — M-Pharmacy" },
      { name: "description", content: "Sign in to your M-Pharmacy account to upload prescriptions, place orders, and manage refills." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message ?? "OAuth failed");
    else if (!result.redirected) navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background">
      <div className="mx-auto flex max-w-md flex-col px-6 py-12">
        <Link to="/" className="flex items-center gap-2 self-start">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Plus className="h-5 w-5" strokeWidth={3} />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            M<span className="text-primary">·</span>Pharmacy
          </span>
        </Link>

        <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure account
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage prescriptions and orders."
              : "Set up your profile to start ordering."}
          </p>

          <div className="mt-6 grid gap-2">
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or {mode === "signin" ? "sign in with email" : "sign up with email"} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <Input label="Full name" value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
            )}
            <Input label="Email" value={email} onChange={setEmail} type="email" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" required />
            <Input label="Password" value={password} onChange={setPassword} type="password" icon={<LockIcon className="h-4 w-4" />} placeholder="••••••••" required />

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to M-Pharmacy?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder, required, icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </label>
  );
}
