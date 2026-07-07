"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-accent text-background">
              <Sparkles size={22} />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted">
              Login to continue managing your expenses
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-muted transition hover:text-accent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-accent hover:brightness-110"
            >
              Forgot password?
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent hover:brightness-110"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Secure authentication powered by Supabase
        </p>
      </div>
    </main>
  );
}
