"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HandCoins,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  Receipt,
  Settings,
  Sparkles,
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
  { id: "add", label: "Add expense", mobileLabel: "Add", icon: PlusCircle },
  { id: "loans", label: "Loans & debts", mobileLabel: "Loans", icon: HandCoins },
  { id: "chat", label: "Ask AI", icon: MessageCircle },
  { id: "transactions", label: "Transactions", mobileLabel: "History", icon: Receipt },
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
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface/60 p-4 backdrop-blur-xl lg:flex">
        <div className="flex h-14 items-center gap-3 px-2">
          <BrandMark />
          <span className="font-semibold tracking-tight">Expense AI</span>
        </div>

        <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Workspace
        </p>
        <nav aria-label="Dashboard sections" className="space-y-1">
          {TABS.map((tab) => (
            <SidebarButton
              key={tab.id}
              tab={tab}
              active={active === tab.id}
              onClick={() => go(tab.id)}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <Link
            href="/settings"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <Settings size={18} />
            Settings
          </Link>
          <div className="mt-1 [&_button]:w-full [&_button]:justify-start [&_button]:rounded-xl [&_button]:border-0 [&_button]:px-3 [&_button]:py-2.5 hover:[&_button]:bg-danger/10">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/88 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden">
                <BrandMark />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold sm:text-base">
                  Welcome, {greetingName}
                </p>
                <p className="hidden text-xs text-muted sm:block">
                  Here is your financial overview.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                aria-label="Settings"
                title="Settings"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted transition hover:border-accent hover:text-foreground lg:hidden"
              >
                <Settings size={16} />
              </Link>
              <div className="lg:hidden">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12 xl:px-10">
          <section id="overview" className="animate-in">
            <BalanceOverview
              balance={totals.balance}
              income={totals.income}
              expense={totals.expense}
              thisMonth={totals.thisMonthExpense}
              currency={currency}
            />

            <div className="mt-5">
              <SpendingCharts
                transactions={transactions}
                currency={currency}
                timezone={timezone}
              />
            </div>

            <div className="mt-5">
              <Budgets
                budgets={budgets}
                transactions={transactions}
                currency={currency}
                timezone={timezone}
              />
            </div>
          </section>

          <section id="add" className="mt-8 animate-in lg:mt-10">
            <SectionTitle
              title="Add an expense"
              subtitle={`Ready to track today's expenses, ${greetingName}? Just type them.`}
            />
            <div className="mt-4">
              <ExpenseInput name={greetingName} currency={currency} />
            </div>
          </section>

          <section id="loans" className="mt-8 animate-in lg:mt-10">
            <SectionTitle
              title="Loans & debts"
              subtitle="Track money you've lent or borrowed."
            />
            <div className="mt-4">
              <Loans loans={loans} currency={currency} />
            </div>
          </section>

          <section id="chat" className="mt-8 animate-in lg:mt-10">
            <SectionTitle
              title="Ask AI"
              subtitle="Ask questions about your spending in plain language."
            />
            <div className="mt-4">
              <ChatPanel name={greetingName} />
            </div>
          </section>

          <section id="transactions" className="mt-8 animate-in lg:mt-10">
            <SectionTitle
              title="Transactions"
              subtitle={`${transactions.length} recorded`}
            />
            <div className="mt-4">
              <TransactionList
                transactions={transactions}
                currency={currency}
              />
            </div>
          </section>

          <section id="insights" className="mt-8 animate-in lg:mt-10">
            <SectionTitle
              title="AI Insights"
              subtitle="Automatic tips based on your spending."
            />
            <div className="mt-4">
              <Insights insights={insights} />
            </div>
          </section>
        </main>
      </div>

      <nav
        aria-label="Mobile dashboard sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/94 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="grid grid-cols-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => go(tab.id)}
                aria-pressed={isActive}
                className={`flex min-w-0 flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] transition ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              >
                <Icon size={19} />
                <span className="w-full truncate">
                  {tab.mobileLabel ?? tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-background shadow-[0_0_24px_rgba(74,222,128,0.14)]">
      <Sparkles size={18} />
    </span>
  );
}

function SidebarButton({
  tab,
  active,
  onClick,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-accent text-background shadow-[0_10px_28px_rgba(74,222,128,0.14)]"
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      <Icon size={18} />
      {tab.label}
    </button>
  );
}

function BalanceOverview({
  balance,
  income,
  expense,
  thisMonth,
  currency,
}: {
  balance: number;
  income: number;
  expense: number;
  thisMonth: number;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.45fr_repeat(3,minmax(0,1fr))] xl:gap-4">
      <div className="relative col-span-2 min-h-44 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-[#101c14] to-surface p-5 sm:p-6 xl:col-span-1">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
        />
        <p className="text-sm text-muted">Current balance</p>
        <p className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl">
          {formatMoney(balance, currency)}
        </p>
        <p className="mt-7 text-xs text-muted">
          Income minus recorded expenses
        </p>
      </div>

      <SummaryCard
        label="Income"
        value={formatMoney(income, currency)}
        tone="accent"
      />
      <SummaryCard
        label="Expenses"
        value={formatMoney(expense, currency)}
        tone="danger"
      />
      <div className="col-span-2 xl:col-span-1">
        <SummaryCard
          label="This month"
          value={formatMoney(thisMonth, currency)}
        />
      </div>
    </div>
  );
}

function SummaryCard({
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
    <div className="flex h-full min-h-32 flex-col justify-between rounded-3xl border border-border bg-surface p-4 sm:min-h-44 sm:p-5">
      <span
        className={`grid h-8 w-8 place-items-center rounded-full ${
          tone === "danger"
            ? "bg-danger/10 text-danger"
            : "bg-accent/10 text-accent"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
      </span>
      <div className="mt-5 min-w-0">
        <p className="text-xs text-muted sm:text-sm">{label}</p>
        <p
          className={`mt-2 break-words text-base font-bold tracking-tight sm:text-xl ${color}`}
        >
          {value}
        </p>
      </div>
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
      <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
      )}
    </div>
  );
}
