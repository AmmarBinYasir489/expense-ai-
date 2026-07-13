"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Trash2,
  Check,
  RotateCcw,
  Plus,
  HandCoins,
} from "lucide-react";
import type { Loan } from "@/lib/types";
import { loanSummary } from "@/lib/loans";
import { formatMoney } from "@/lib/format";

export default function Loans({
  loans,
  currency,
}: {
  loans: Loan[];
  currency: string;
}) {
  const router = useRouter();
  const summary = useMemo(() => loanSummary(loans), [loans]);

  const [direction, setDirection] = useState<"lent" | "borrowed">("lent");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const outstanding = loans.filter((l) => l.status === "outstanding");
  const repaid = loans.filter((l) => l.status === "repaid");

  async function addLoan(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!person.trim() || !amount || Number(amount) <= 0) {
      setError("Enter a name and an amount greater than 0.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          person,
          amount: Number(amount),
          due_date: dueDate || null,
          description: description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      setPerson("");
      setAmount("");
      setDueDate("");
      setDescription("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: "outstanding" | "repaid") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <HandCoins size={18} className="text-accent" />
        <h3 className="font-semibold">Loans &amp; debts</h3>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-background/40 p-4">
          <p className="text-xs text-muted">Owed to you</p>
          <p className="mt-1 text-xl font-bold text-accent">
            {formatMoney(summary.owedToYou, currency)}
          </p>
        </div>
        <div className="rounded-2xl bg-background/40 p-4">
          <p className="text-xs text-muted">You owe</p>
          <p className="mt-1 text-xl font-bold text-danger">
            {formatMoney(summary.youOwe, currency)}
          </p>
        </div>
      </div>

      {/* Outstanding list */}
      <div className="mt-5 space-y-2">
        {outstanding.length === 0 && repaid.length === 0 ? (
          <p className="text-sm text-muted">
            No loans yet. Record money you lent or borrowed below.
          </p>
        ) : (
          outstanding.map((l) => (
            <LoanRow
              key={l.id}
              loan={l}
              currency={currency}
              busy={busyId === l.id}
              onRepaid={() => setStatus(l.id, "repaid")}
              onReopen={() => setStatus(l.id, "outstanding")}
              onDelete={() => remove(l.id)}
            />
          ))
        )}

        {repaid.length > 0 && (
          <>
            <p className="pt-2 text-xs font-medium uppercase tracking-wide text-muted">
              Settled
            </p>
            {repaid.map((l) => (
              <LoanRow
                key={l.id}
                loan={l}
                currency={currency}
                busy={busyId === l.id}
                onRepaid={() => setStatus(l.id, "repaid")}
                onReopen={() => setStatus(l.id, "outstanding")}
                onDelete={() => remove(l.id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Add form */}
      <form
        onSubmit={addLoan}
        className="mt-5 space-y-3 border-t border-border pt-4"
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-1">
          <button
            type="button"
            onClick={() => setDirection("lent")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              direction === "lent"
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            I lent
          </button>
          <button
            type="button"
            onClick={() => setDirection("borrowed")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              direction === "borrowed"
                ? "bg-danger/15 text-danger"
                : "text-muted hover:text-foreground"
            }`}
          >
            I borrowed
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder={direction === "lent" ? "Who owes you?" : "Who do you owe?"}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
          />
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currency})`}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">
              Due date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">
              Note (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. for concert tickets"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Add loan
        </button>
      </form>
    </div>
  );
}

function LoanRow({
  loan,
  currency,
  busy,
  onRepaid,
  onReopen,
  onDelete,
}: {
  loan: Loan;
  currency: string;
  busy: boolean;
  onRepaid: () => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const isLent = loan.direction === "lent";
  const settled = loan.status === "repaid";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 ${
        settled ? "opacity-60" : ""
      }`}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{
          background: isLent
            ? "color-mix(in srgb, var(--accent) 15%, transparent)"
            : "color-mix(in srgb, var(--danger) 15%, transparent)",
          color: isLent ? "var(--accent)" : "var(--danger)",
        }}
      >
        {isLent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{loan.person}</p>
        <p className="truncate text-xs text-muted">
          {isLent ? "You lent" : "You borrowed"}
          {loan.due_date
            ? ` · due ${new Date(loan.due_date).toLocaleDateString()}`
            : ""}
          {loan.description ? ` · ${loan.description}` : ""}
        </p>
      </div>

      <p
        className={`shrink-0 text-sm font-semibold ${
          isLent ? "text-accent" : "text-danger"
        }`}
      >
        {formatMoney(Number(loan.amount), loan.currency || currency)}
      </p>

      {settled ? (
        <button
          onClick={onReopen}
          disabled={busy}
          aria-label="Reopen loan"
          title="Mark as outstanding"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RotateCcw size={15} />
          )}
        </button>
      ) : (
        <button
          onClick={onRepaid}
          disabled={busy}
          aria-label="Mark as repaid"
          title="Mark as repaid"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-accent/10 hover:text-accent disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </button>
      )}

      <button
        onClick={onDelete}
        disabled={busy}
        aria-label="Delete loan"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
