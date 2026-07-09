"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Loader2, Inbox, Pencil, X, Download } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatSigned } from "@/lib/format";

export default function TransactionList({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const categories = useMemo(() => {
    return ["all", ...new Set(transactions.map((t) => t.category || "Other"))];
  }, [transactions]);

  const allCategories = useMemo(
    () => [...new Set(transactions.map((t) => t.category).filter(Boolean))],
    [transactions]
  );

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

  function exportCsv() {
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
    const rows = transactions.map((t) => [
      (t.date ?? t.created_at)?.slice(0, 10),
      t.type,
      t.category,
      t.description ?? "",
      t.amount,
      t.currency || currency,
    ]);
    const csv =
      "﻿" +
      [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <button
          type="button"
          onClick={exportCsv}
          disabled={transactions.length === 0}
          title="Export all transactions as CSV"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground disabled:opacity-50"
        >
          <Download size={16} />
          <span className="sm:hidden md:inline">Export</span>
        </button>
      </div>

      {/* List — capped height so many records scroll instead of growing the page */}
      <div className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
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
                {formatSigned(Number(t.amount), t.type, t.currency || currency)}
              </p>

              <button
                onClick={() => setEditing(t)}
                aria-label="Edit transaction"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
              >
                <Pencil size={15} />
              </button>

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

      {editing && (
        <EditModal
          transaction={editing}
          categories={allCategories}
          currency={currency}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  transaction,
  categories,
  currency,
  onClose,
  onSaved,
}: {
  transaction: Transaction;
  categories: string[];
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<"expense" | "income">(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount ?? ""));
  const [category, setCategory] = useState(transaction.category ?? "");
  const [description, setDescription] = useState(transaction.description ?? "");
  const [date, setDate] = useState(
    (transaction.date ?? transaction.created_at)?.slice(0, 10) ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!category.trim() || !amount || Number(amount) <= 0) {
      setError("Enter a category and an amount greater than 0.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          description,
          date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      onSaved();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit transaction</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="mt-5 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-1">
            {(["expense", "income"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setType(opt)}
                className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
                  type === opt
                    ? opt === "income"
                      ? "bg-accent/15 text-accent"
                      : "bg-danger/15 text-danger"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Amount ({currency})
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Category
            </label>
            <input
              list="edit-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            />
            <datalist id="edit-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
