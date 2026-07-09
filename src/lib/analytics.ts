import type { Transaction, Budget } from "./types";
import { formatMoney, DEFAULT_CURRENCY } from "./format";

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

export type CategoryChange = {
  category: string;
  thisMonth: number;
  lastMonth: number;
  changePct: number | null; // null when there was no spending last month
};

// This-month vs last-month expense per category, sorted by largest increase.
export function categoryMonthChanges(txs: Transaction[]): CategoryChange[] {
  const now = new Date();
  const thisKey = monthKey(now);
  const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const map = new Map<string, { thisMonth: number; lastMonth: number }>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = monthKey(txDate(t));
    if (key !== thisKey && key !== lastKey) continue;
    const cat = t.category || "Other";
    const entry = map.get(cat) ?? { thisMonth: 0, lastMonth: 0 };
    if (key === thisKey) entry.thisMonth += Number(t.amount) || 0;
    else entry.lastMonth += Number(t.amount) || 0;
    map.set(cat, entry);
  }

  return [...map.entries()]
    .map(([category, v]) => ({
      category,
      thisMonth: v.thisMonth,
      lastMonth: v.lastMonth,
      changePct:
        v.lastMonth > 0
          ? ((v.thisMonth - v.lastMonth) / v.lastMonth) * 100
          : null,
    }))
    .sort((a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity));
}

// Whether income categorized as salary landed this month vs. previous months.
function salaryStatus(txs: Transaction[]): "received" | "pending" | "unknown" {
  const now = new Date();
  const thisKey = monthKey(now);
  let hadSalaryBefore = false;
  let salaryThisMonth = false;
  for (const t of txs) {
    if (t.type !== "income") continue;
    if (!/salary|payroll|wage|paycheck/i.test(t.category)) continue;
    if (monthKey(txDate(t)) === thisKey) salaryThisMonth = true;
    else hadSalaryBefore = true;
  }
  if (salaryThisMonth) return "received";
  if (hadSalaryBefore) return "pending";
  return "unknown";
}

export type Insight = { tone: "good" | "warn" | "info"; text: string };

export function computeInsights(
  txs: Transaction[],
  currency: string = DEFAULT_CURRENCY
): Insight[] {
  if (txs.length === 0) return [];

  const fmt = (n: number) => formatMoney(n, currency);
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

  // Biggest per-category swing this month vs last month
  const changes = categoryMonthChanges(txs).filter(
    (c) => c.changePct !== null && Math.abs(c.changePct) >= 15
  );
  const biggestUp = changes[0];
  if (biggestUp && (biggestUp.changePct ?? 0) > 0) {
    const pct = Math.round(biggestUp.changePct!);
    insights.push({
      tone: "warn",
      text:
        pct >= 100
          ? `${biggestUp.category} spending ${
              pct >= 100 && pct < 200 ? "doubled" : `is up ${pct}%`
            } this month (${fmt(biggestUp.thisMonth)}).`
          : `You spent ${pct}% more on ${biggestUp.category} this month.`,
    });
  }
  const biggestDown = [...changes].reverse()[0];
  if (biggestDown && (biggestDown.changePct ?? 0) <= -15) {
    insights.push({
      tone: "good",
      text: `${biggestDown.category} is ${Math.abs(
        Math.round(biggestDown.changePct!)
      )}% lower than last month.`,
    });
  }

  // Category share of total expenses
  if (cats.length > 0 && totals.expense > 0) {
    const top = cats[0];
    const share = Math.round((top.total / totals.expense) * 100);
    insights.push({
      tone: "info",
      text: `${top.category} accounts for ${share}% of your total spending (${fmt(
        top.total
      )}).`,
    });
  }

  // Salary status
  const salary = salaryStatus(txs);
  if (salary === "pending") {
    insights.push({
      tone: "warn",
      text: "You haven't recorded your salary yet this month.",
    });
  }

  // Net position
  if (totals.income > 0) {
    if (totals.balance >= 0) {
      insights.push({
        tone: "good",
        text: `You're net positive by ${fmt(totals.balance)} overall.`,
      });
    } else {
      insights.push({
        tone: "warn",
        text: `You're spending more than you earn by ${fmt(
          Math.abs(totals.balance)
        )}.`,
      });
    }
  }

  return insights;
}

export type BudgetProgress = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  pct: number; // 0..100+ (clamped only for the bar width in UI)
  status: "ok" | "near" | "over";
};

// Spend-this-month per category vs. each budget limit.
export function budgetProgress(
  txs: Transaction[],
  budgets: Budget[]
): BudgetProgress[] {
  const changes = categoryMonthChanges(txs);
  const spentByCat = new Map(changes.map((c) => [c.category, c.thisMonth]));

  return budgets
    .map((b) => {
      const spent = spentByCat.get(b.category) ?? 0;
      const limit = Number(b.amount) || 0;
      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      const status: BudgetProgress["status"] =
        pct >= 100 ? "over" : pct >= 80 ? "near" : "ok";
      return {
        category: b.category,
        limit,
        spent,
        remaining: limit - spent,
        pct,
        status,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

export function computeBudgetInsights(
  txs: Transaction[],
  budgets: Budget[],
  currency: string = DEFAULT_CURRENCY
): Insight[] {
  if (budgets.length === 0) return [];
  const fmt = (n: number) => formatMoney(n, currency);
  const insights: Insight[] = [];

  for (const p of budgetProgress(txs, budgets)) {
    const pct = Math.round(p.pct);
    if (p.status === "over") {
      insights.push({
        tone: "warn",
        text: `You're over your ${p.category} budget — ${fmt(
          p.spent
        )} of ${fmt(p.limit)} (${pct}%).`,
      });
    } else if (p.status === "near") {
      insights.push({
        tone: "warn",
        text: `You've used ${pct}% of your ${p.category} budget (${fmt(
          p.spent
        )} of ${fmt(p.limit)}).`,
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
