"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    setIsError(true);

    if (!password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setMessage("Include at least one uppercase letter and one number");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage("Password updated successfully. Redirecting…");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
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
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-muted">Enter your new password.</p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update password"}
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
      </div>
    </main>
  );
}
