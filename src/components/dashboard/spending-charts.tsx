"use client";

import { useMemo } from "react";
import type { Transaction } from "@/lib/types";
import { byCategory, byMonth, CHART_COLORS } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";

export default function SpendingCharts({
  transactions,
  currency,
  timezone,
}: {
  transactions: Transaction[];
  currency: string;
  timezone: string;
}) {
  const categories = useMemo(
    () => byCategory(transactions).slice(0, 6),
    [transactions]
  );
  const months = useMemo(
    () => byMonth(transactions, 6, timezone),
    [transactions, timezone]
  );

  const hasData = categories.length > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Donut: spending by category */}
      <div className="rounded-3xl border border-border bg-surface p-5">
        <h3 className="font-semibold">By category</h3>
        {hasData ? (
          <div className="mt-4 flex items-center gap-5">
            <Donut slices={categories} />
            <ul className="flex-1 space-y-2">
              {categories.map((c, i) => (
                <li
                  key={c.category}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-muted">
                    {c.category}
                  </span>
                  <span className="font-medium">
                    {formatMoney(c.total, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Empty />
        )}
      </div>

      {/* Bars: last 6 months */}
      <div className="rounded-3xl border border-border bg-surface p-5">
        <h3 className="font-semibold">Last 6 months</h3>
        {hasData ? (
          <Bars months={months} currency={currency} />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}

function Donut({ slices }: { slices: { category: string; total: number }[] }) {
  const total = slices.reduce((s, c) => s + c.total, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth="12"
      />
      {slices.map((s, i) => {
        const frac = total > 0 ? s.total / total : 0;
        const dash = frac * circumference;
        const offset = slices.slice(0, i).reduce((sum, previous) => {
          const previousFraction = total > 0 ? previous.total / total : 0;
          return sum + previousFraction * circumference;
        }, 0);

        return (
          <circle
            key={s.category}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(n));
}

function Bars({
  months,
  currency,
}: {
  months: { label: string; total: number }[];
  currency: string;
}) {
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <div className="mt-6 flex h-44 items-end justify-between gap-2">
      {months.map((m) => {
        const pct = (m.total / max) * 100;
        return (
          <div
            key={m.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-[11px] font-medium tabular-nums text-muted">
              {m.total > 0 ? compact(m.total) : ""}
            </span>
            <div
              className={`w-full rounded-t-lg transition-all ${
                m.total > 0 ? "bg-accent/80" : "bg-surface-2"
              }`}
              style={{ height: `${m.total > 0 ? Math.max(pct, 4) : 4}%` }}
              title={formatMoney(m.total, currency)}
            />
            <span className="text-xs text-muted">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted">
      No expense data yet.
    </div>
  );
}
