"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Target, Plus } from "lucide-react";
import type { Budget, Transaction } from "@/lib/types";
import { budgetProgress } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";

const STATUS_COLOR = {
  ok: "var(--accent)",
  near: "var(--accent-4)",
  over: "var(--danger)",
} as const;

export default function Budgets({
  budgets,
  transactions,
  currency,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  currency: string;
}) {
  const router = useRouter();
  const progress = useMemo(
    () => budgetProgress(transactions, budgets),
    [transactions, budgets]
  );

  const categories = useMemo(
    () => [...new Set(transactions.map((t) => t.category).filter(Boolean))],
    [transactions]
  );

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!category.trim() || !amount) {
      setError("Pick a category and an amount.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      setCategory("");
      setAmount("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeBudget(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  const budgetByCategory = new Map(budgets.map((b) => [b.category, b.id]));

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Target size={18} className="text-accent" />
        <h3 className="font-semibold">Monthly budgets</h3>
      </div>

      {/* Progress list */}
      <div className="mt-4 space-y-4">
        {progress.length === 0 ? (
          <p className="text-sm text-muted">
            No budgets yet. Set a monthly limit for a category below to track
            your spending against it.
          </p>
        ) : (
          progress.map((p) => {
            const id = budgetByCategory.get(p.category);
            const width = Math.min(p.pct, 100);
            const color = STATUS_COLOR[p.status];
            return (
              <div key={p.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.category}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="tabular-nums"
                      style={{ color: p.status === "ok" ? undefined : color }}
                    >
                      {formatMoney(p.spent, currency)} /{" "}
                      {formatMoney(p.limit, currency)}
                    </span>
                    <button
                      onClick={() => setCategory(p.category)}
                      className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
                    >
                      edit
                    </button>
                    {id && (
                      <button
                        onClick={() => removeBudget(id)}
                        disabled={deleting === id}
                        aria-label={`Delete ${p.category} budget`}
                        className="text-muted transition hover:text-danger disabled:opacity-50"
                      >
                        {deleting === id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${width}%`, background: color }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {p.remaining >= 0
                    ? `${formatMoney(p.remaining, currency)} left`
                    : `${formatMoney(-p.remaining, currency)} over`}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add / edit form */}
      <form
        onSubmit={saveBudget}
        className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row"
      >
        <input
          list="budget-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. Food)"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
        />
        <datalist id="budget-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Limit (${currency})`}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent sm:w-40"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Set
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
