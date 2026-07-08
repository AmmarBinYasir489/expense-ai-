"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

type Feedback = { type: "success" | "error"; text: string } | null;

type ParsedItem = {
  category: string;
  amount: number;
  type: "income" | "expense";
};

const EXAMPLES = [
  "Bought coffee for 500 today",
  "Paid 12000 rent",
  "Got 50000 salary",
  "Uber ride 850",
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
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submitExpense() {
    if (!text.trim()) {
      setFeedback({ type: "error", text: "Please enter an expense." });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const aiResponse = await fetch("/api/ai/transaction/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const parsed = await aiResponse.json();

      if (!aiResponse.ok) {
        setFeedback({
          type: "error",
          text: parsed.error || "AI couldn't understand that. Try again.",
        });
        return;
      }

      const items: ParsedItem[] = parsed.transactions ?? [];

      const saveResponse = await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const saved = await saveResponse.json();

      if (saveResponse.ok) {
        const count = saved.count ?? items.length;
        let text: string;
        if (count === 1 && items[0]) {
          const it = items[0];
          const kind = it.type === "income" ? "income" : "expense";
          text = `Great, ${name}! I've saved your ${it.category} ${kind} of ${formatMoney(
            it.amount,
            currency
          )}.`;
        } else {
          text = `Great, ${name}! I've saved ${count} transactions: ${items
            .map((i) => i.category)
            .join(", ")}.`;
        }
        setFeedback({ type: "success", text });
        setText("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: saved.error || "Saving failed." });
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitExpense();
        }}
        placeholder="e.g. Bought coffee for 500 today"
        className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
        rows={3}
      />

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

      <button
        onClick={submitExpense}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {loading ? (
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
    </div>
  );
}
