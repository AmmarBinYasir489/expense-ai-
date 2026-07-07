import type { Transaction } from "./types";
import { formatMoney } from "./format";

// Prefer the AI-parsed `date`; fall back to the DB insert time.
function txDate(t: Transaction): Date {
  return new Date(t.date ?? t.created_at);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type Totals = {
  income: number;
  expense: number;
  balance: number;
  thisMonthExpense: number;
  lastMonthExpense: number;
};

export function computeTotals(txs: Transaction[]): Totals {
  const now = new Date();
  const thisKey = monthKey(now);
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  let income = 0;
  let expense = 0;
  let thisMonthExpense = 0;
  let lastMonthExpense = 0;

  for (const t of txs) {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") income += amt;
    else {
      expense += amt;
      const key = monthKey(txDate(t));
      if (key === thisKey) thisMonthExpense += amt;
      else if (key === lastKey) lastMonthExpense += amt;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    thisMonthExpense,
    lastMonthExpense,
  };
}

export type CategorySlice = { category: string; total: number };

export function byCategory(txs: Transaction[]): CategorySlice[] {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const cat = t.category || "Other";
    map.set(cat, (map.get(cat) ?? 0) + (Number(t.amount) || 0));
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export type MonthBar = { label: string; total: number };

export function byMonth(txs: Transaction[], months = 6): MonthBar[] {
  const now = new Date();
  const buckets: MonthBar[] = [];
  const index = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    index.set(monthKey(d), buckets.length);
    buckets.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      total: 0,
    });
  }

  for (const t of txs) {
    if (t.type !== "expense") continue;
    const pos = index.get(monthKey(txDate(t)));
    if (pos !== undefined) buckets[pos].total += Number(t.amount) || 0;
  }

  return buckets;
}

export type Insight = { tone: "good" | "warn" | "info"; text: string };

export function computeInsights(txs: Transaction[]): Insight[] {
  if (txs.length === 0) return [];

  const totals = computeTotals(txs);
  const cats = byCategory(txs);
  const insights: Insight[] = [];

  // Month-over-month change
  if (totals.lastMonthExpense > 0) {
    const diff =
      ((totals.thisMonthExpense - totals.lastMonthExpense) /
        totals.lastMonthExpense) *
      100;
    const pct = Math.abs(Math.round(diff));
    if (diff < -1) {
      insights.push({
        tone: "good",
        text: `You've spent ${pct}% less this month than last month. Keep it up!`,
      });
    } else if (diff > 1) {
      insights.push({
        tone: "warn",
        text: `Your spending is up ${pct}% versus last month.`,
      });
    }
  }

  // Top category + savings suggestion
  if (cats.length > 0) {
    const top = cats[0];
    insights.push({
      tone: "info",
      text: `Your highest spending category is ${top.category} (${formatMoney(
        top.total
      )}).`,
    });
    const saving = Math.round(top.total * 0.2);
    if (saving > 0) {
      insights.push({
        tone: "good",
        text: `Cutting ${top.category} by 20% would save about ${formatMoney(
          saving
        )}.`,
      });
    }
  }

  // Net position
  if (totals.income > 0) {
    if (totals.balance >= 0) {
      insights.push({
        tone: "good",
        text: `You're net positive by ${formatMoney(totals.balance)} overall.`,
      });
    } else {
      insights.push({
        tone: "warn",
        text: `You're spending more than you earn by ${formatMoney(
          Math.abs(totals.balance)
        )}.`,
      });
    }
  }

  return insights;
}

// A stable color per chart slice, cycling through the theme accents.
export const CHART_COLORS = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--accent-3)",
  "var(--accent-4)",
  "var(--danger)",
  "#2dd4bf",
  "#f472b6",
  "#93c5fd",
];
