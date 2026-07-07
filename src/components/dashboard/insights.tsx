import { TrendingDown, TrendingUp, Lightbulb, Sparkles } from "lucide-react";
import type { Insight } from "@/lib/analytics";

const ICONS = {
  good: TrendingDown,
  warn: TrendingUp,
  info: Lightbulb,
} as const;

const TONE = {
  good: "text-accent bg-accent/10",
  warn: "text-danger bg-danger/10",
  info: "text-accent-2 bg-accent-2/10",
} as const;

export default function Insights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface p-10 text-center text-muted">
        <Sparkles size={26} className="text-accent" />
        <p className="text-sm">
          Add a few expenses and personalized insights will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {insights.map((insight, i) => {
        const Icon = ICONS[insight.tone];
        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                TONE[insight.tone]
              }`}
            >
              <Icon size={18} />
            </span>
            <p className="text-sm leading-6">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
