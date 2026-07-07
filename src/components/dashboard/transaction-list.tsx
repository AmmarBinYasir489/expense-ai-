"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Loader2, Inbox } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatSigned } from "@/lib/format";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ["all", ...new Set(transactions.map((t) => t.category || "Other"))];
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (category !== "all" && (t.category || "Other") !== category)
        return false;
      if (!q) return true;
      return (
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [transactions, query, category]);

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 sm:p-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-accent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
            <Inbox size={28} />
            <p className="text-sm">
              {transactions.length === 0
                ? "No transactions yet. Add your first above."
                : "No transactions match your filters."}
            </p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 transition hover:border-border/80"
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold uppercase"
                style={{
                  background:
                    t.type === "income"
                      ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                      : "color-mix(in srgb, var(--danger) 15%, transparent)",
                  color:
                    t.type === "income" ? "var(--accent)" : "var(--danger)",
                }}
              >
                {(t.category || "?").slice(0, 2)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.category || "Other"}</p>
                <p className="truncate text-xs text-muted">
                  {t.description || "—"} ·{" "}
                  {new Date(t.date ?? t.created_at).toLocaleDateString()}
                </p>
              </div>

              <p
                className={`shrink-0 text-sm font-semibold ${
                  t.type === "income" ? "text-accent" : "text-foreground"
                }`}
              >
                {formatSigned(Number(t.amount), t.type)}
              </p>

              <button
                onClick={() => remove(t.id)}
                disabled={deletingId === t.id}
                aria-label="Delete transaction"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                {deletingId === t.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
