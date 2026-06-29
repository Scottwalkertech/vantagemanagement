import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Vantage" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-2xl font-extrabold uppercase italic">
          Vantage.
        </Link>
        <h1 className="mt-12 font-display text-3xl uppercase">
          {mode === "signin" ? "Admin Access" : "Create Account"}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-pearl/40">
          Staff only
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-pearl/20 bg-transparent py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-pearl/50">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-pearl/20 bg-transparent py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gold py-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-obsidian disabled:opacity-50"
          >
            {busy ? "…" : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-[10px] uppercase tracking-[0.3em] text-pearl/50 hover:text-gold"
        >
          {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
        </button>
        <div className="mt-12 border-t border-pearl/10 pt-6">
          <Link to="/" className="text-[10px] uppercase tracking-[0.3em] text-pearl/40 hover:text-gold">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
