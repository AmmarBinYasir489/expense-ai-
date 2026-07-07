"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendResetEmail() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage("Reset email sent. Check your inbox.");
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email to receive a reset link.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
        />

        <button
          onClick={sendResetEmail}
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {message && (
          <p
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
              isError
                ? "bg-danger/10 text-danger"
                : "bg-accent/10 text-accent"
            }`}
          >
            {message}
          </p>
        )}

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </main>
  );
}
