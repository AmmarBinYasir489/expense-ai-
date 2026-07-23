"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Sparkles,
  MessageCircle,
  Settings,
  HandCoins,
} from "lucide-react";
import type { Transaction, Budget, Loan } from "@/lib/types";
import {
  computeTotals,
  computeInsights,
  computeBudgetInsights,
} from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import { firstName } from "@/lib/profile";
import LogoutButton from "@/components/auth/logout-button";
import ExpenseInput from "@/components/dashboard/expense-input";
import TransactionList from "@/components/dashboard/transaction-list";
import SpendingCharts from "@/components/dashboard/spending-charts";
import Budgets from "@/components/dashboard/budgets";
import Loans from "@/components/dashboard/loans";
import Insights from "@/components/dashboard/insights";
import ChatPanel from "@/components/dashboard/chat-panel";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "add", label: "Add", icon: PlusCircle },
  { id: "loans", label: "Loans", icon: HandCoins },
  { id: "chat", label: "Ask AI", icon: MessageCircle },
  { id: "transactions", label: "History", icon: Receipt },
  { id: "insights", label: "Insights", icon: Sparkles },
];

export default function DashboardShell({
  name,
  currency,
  timezone,
  transactions,
  budgets,
  loans,
}: {
  name: string;
  currency: string;
  timezone: string;
  transactions: Transaction[];
  budgets: Budget[];
  loans: Loan[];
}) {
  const [active, setActive] = useState("overview");
  const totals = computeTotals(transactions, timezone);
  const insights = [
    ...computeBudgetInsights(transactions, budgets, currency, timezone),
    ...computeInsights(transactions, currency, timezone),
  ];
  const greetingName = firstName(name);

  function go(id: string) {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-background">
              <Sparkles size={18} />
            </span>
            <span className="hidden sm:inline">Expense AI</span>
          </div>

          {/* Desktop section nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active === t.id
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted lg:inline">
              Hi, <span className="text-foreground">{greetingName}</span>
            </span>
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted transition hover:border-accent hover:text-foreground"
            >
              <Settings size={16} />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Single scrollable page */}
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        {/* Overview */}
        <section id="overview" className="animate-in">
          <BalanceHero
            greeting={`Welcome back, ${greetingName}`}
            balance={totals.balance}
            income={totals.income}
            expense={totals.expense}
            thisMonth={totals.thisMonthExpense}
            currency={currency}
          />
          <div className="mt-6">
            <SpendingCharts
              transactions={transactions}
              currency={currency}
              timezone={timezone}
            />
          </div>
          <div className="mt-6">
            <Budgets
              budgets={budgets}
              transactions={transactions}
              currency={currency}
              timezone={timezone}
            />
          </div>
        </section>

        {/* Add */}
        <section id="add" className="mt-10 animate-in">
          <SectionTitle
            title="Add an expense"
            subtitle={`Ready to track today's expenses, ${greetingName}? Just type them.`}
          />
          <div className="mt-4">
            <ExpenseInput name={greetingName} currency={currency} />
          </div>
        </section>

        {/* Loans */}
        <section id="loans" className="mt-10 animate-in">
          <SectionTitle
            title="Loans & debts"
            subtitle="Track money you've lent or borrowed."
          />
          <div className="mt-4">
            <Loans loans={loans} currency={currency} />
          </div>
        </section>

        {/* Ask AI */}
        <section id="chat" className="mt-10 animate-in">
          <SectionTitle
            title="Ask AI"
            subtitle="Ask questions about your spending in plain language."
          />
          <div className="mt-4">
            <ChatPanel name={greetingName} />
          </div>
        </section>

        {/* Transactions */}
        <section id="transactions" className="mt-10 animate-in">
          <SectionTitle
            title="Transactions"
            subtitle={`${transactions.length} recorded`}
          />
          <div className="mt-4">
            <TransactionList transactions={transactions} currency={currency} />
          </div>
        </section>

        {/* Insights */}
        <section id="insights" className="mt-10 animate-in">
          <SectionTitle
            title="AI Insights"
            subtitle="Automatic tips based on your spending."
          />
          <div className="mt-4">
            <Insights insights={insights} />
          </div>
        </section>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              >
                <Icon size={20} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function BalanceHero({
  greeting,
  balance,
  income,
  expense,
  thisMonth,
  currency,
}: {
  greeting: string;
  balance: number;
  income: number;
  expense: number;
  thisMonth: number;
  currency: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
      />
      <p className="text-sm font-medium text-accent">{greeting} 👋</p>
      <p className="mt-4 text-sm text-muted">Current balance</p>
      <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
        {formatMoney(balance, currency)}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat
          label="Income"
          value={formatMoney(income, currency)}
          tone="accent"
        />
        <MiniStat
          label="Expenses"
          value={formatMoney(expense, currency)}
          tone="danger"
        />
        <MiniStat
          label="This month"
          value={formatMoney(thisMonth, currency)}
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "accent" | "danger";
}) {
  const color =
    tone === "accent"
      ? "text-accent"
      : tone === "danger"
      ? "text-danger"
      : "text-foreground";
  return (
    <div className="rounded-2xl bg-background/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-sm font-semibold sm:text-base ${color}`}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
