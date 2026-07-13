"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from "lucide-react";
import { formatMoney } from "@/lib/format";

type Feedback = { type: "success" | "error"; text: string } | null;

type ParsedTx = {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date?: string;
  confidence?: number;
};

type ParsedLoan = {
  direction: "lent" | "borrowed";
  person: string;
  amount: number;
  description?: string | null;
};

type Parsed = { transactions: ParsedTx[]; loans: ParsedLoan[] };

const EXAMPLES = [
  "Bought coffee for 500 today",
  "Paid 12000 rent",
  "Got 50000 salary",
  "Me and Ali bought groceries for 6000, I paid, Ali owes me 2000",
];

export default function ExpenseInput({
  name,
  currency,
}: {
  name: string;
  currency: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState<Parsed | null>(null);

  async function parse() {
    if (!text.trim()) {
      setFeedback({ type: "error", text: "Please enter an expense." });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      setPending(null);

      const res = await fetch("/api/ai/transaction/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const parsed = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: parsed.error || "AI couldn't understand that. Try again.",
        });
        return;
      }

      const data: Parsed = {
        transactions: parsed.transactions ?? [],
        loans: parsed.loans ?? [],
      };

      // Splits (loans present) go through a preview; plain entries save directly.
      if (data.loans.length > 0) {
        setPending(data);
      } else {
        await save(data);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  async function save(data: Parsed) {
    setSaving(true);
    setFeedback(null);
    try {
      // Save transactions (if any)
      if (data.transactions.length > 0) {
        const res = await fetch("/api/transactions/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: data.transactions }),
        });
        if (!res.ok) {
          const e = await res.json();
          setFeedback({ type: "error", text: e.error || "Saving failed." });
          return;
        }
      }

      // Save loans one by one
      for (const loan of data.loans) {
        const res = await fetch("/api/loans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direction: loan.direction,
            person: loan.person,
            amount: loan.amount,
            description: loan.description ?? null,
          }),
        });
        if (!res.ok) {
          const e = await res.json();
          setFeedback({
            type: "error",
            text: e.error || "Could not save the loan.",
          });
          return;
        }
      }

      setFeedback({ type: "success", text: buildMessage(data) });
      setText("");
      setPending(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  function buildMessage(data: Parsed): string {
    const parts: string[] = [];
    for (const t of data.transactions) {
      parts.push(
        `${formatMoney(t.amount, currency)} ${t.category} ${t.type}`
      );
    }
    for (const l of data.loans) {
      parts.push(
        l.direction === "lent"
          ? `${formatMoney(l.amount, currency)} lent to ${l.person}`
          : `${formatMoney(l.amount, currency)} borrowed from ${l.person}`
      );
    }
    return `Great, ${name}! I've saved ${parts.join(" · ")}.`;
  }

  const busy = loading || saving;

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") parse();
        }}
        placeholder="e.g. Bought coffee for 500 today"
        className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
        rows={3}
        disabled={!!pending}
      />

      {!pending && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Preview for splits */}
      {pending && (
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm font-medium">Here's what I understood:</p>
          <div className="mt-3 space-y-2">
            {pending.transactions.map((t, i) => (
              <PreviewRow
                key={`t${i}`}
                icon={<Receipt size={15} />}
                tone="expense"
                label={`${t.category} ${t.type}`}
                sub={t.description}
                amount={formatMoney(t.amount, currency)}
              />
            ))}
            {pending.loans.map((l, i) => (
              <PreviewRow
                key={`l${i}`}
                icon={
                  l.direction === "lent" ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownLeft size={15} />
                  )
                }
                tone={l.direction === "lent" ? "lent" : "borrowed"}
                label={
                  l.direction === "lent"
                    ? `${l.person} owes you`
                    : `You owe ${l.person}`
                }
                sub={l.description ?? undefined}
                amount={formatMoney(l.amount, currency)}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPending(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => save(pending)}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          className={`mt-3 rounded-xl px-4 py-2.5 text-sm ${
            feedback.type === "success"
              ? "bg-accent/10 text-accent"
              : "bg-danger/10 text-danger"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {!pending && (
        <button
          onClick={parse}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {busy ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Add with AI
            </>
          )}
        </button>
      )}
    </div>
  );
}

function PreviewRow({
  icon,
  tone,
  label,
  sub,
  amount,
}: {
  icon: React.ReactNode;
  tone: "expense" | "lent" | "borrowed";
  label: string;
  sub?: string;
  amount: string;
}) {
  const color =
    tone === "lent"
      ? "var(--accent)"
      : tone === "borrowed"
      ? "var(--danger)"
      : "var(--foreground)";
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/50 p-2.5">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{
          background: "color-mix(in srgb, currentColor 12%, transparent)",
          color,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
      <span className="shrink-0 text-sm font-semibold" style={{ color }}>
        {amount}
      </span>
    </div>
  );
}
