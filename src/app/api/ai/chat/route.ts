import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/types";
import {
  computeTotals,
  byCategory,
  byMonth,
  categoryMonthChanges,
  budgetProgress,
} from "@/lib/analytics";
import { getBudgets } from "@/lib/budgets";
import { getLoans, loanSummary } from "@/lib/loans";
import type { Budget, Loan } from "@/lib/types";
import { getProfile, profileDefaults } from "@/lib/profile";
import { todayInTimezone } from "@/lib/datetime";

// Gemini model for reasoning over the user's data.
const CHAT_MODEL = "gemini-2.5-flash";
const MAX_TX = 250; // cap raw rows sent to the model
const MAX_HISTORY = 8; // recent turns kept for context

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildContext(
  txs: Transaction[],
  budgets: Budget[],
  loans: Loan[],
  currency: string,
  timezone: string
) {
  const totals = computeTotals(txs);
  const changes = categoryMonthChanges(txs);
  const recent = txs.slice(0, MAX_TX).map((t) => ({
    date: (t.date ?? t.created_at)?.slice(0, 10),
    type: t.type,
    amount: Number(t.amount) || 0,
    category: t.category,
    description: t.description,
  }));

  return {
    currency,
    today: todayInTimezone(timezone),
    totals: {
      totalIncome: totals.income,
      totalExpense: totals.expense,
      balance: totals.balance,
      thisMonthExpense: totals.thisMonthExpense,
      lastMonthExpense: totals.lastMonthExpense,
    },
    // Read these directly for "how much did I spend on X this/last month".
    spendingThisMonthByCategory: changes.map((c) => ({
      category: c.category,
      amount: c.thisMonth,
    })),
    spendingLastMonthByCategory: changes.map((c) => ({
      category: c.category,
      amount: c.lastMonth,
    })),
    spendingByCategoryAllTime: byCategory(txs),
    last6MonthsExpense: byMonth(txs, 6),
    thisVsLastMonthByCategory: changes,
    budgets: budgetProgress(txs, budgets),
    loans: {
      summary: loanSummary(loans),
      outstanding: loans
        .filter((l) => l.status === "outstanding")
        .map((l) => ({
          direction: l.direction, // "lent" = they owe you; "borrowed" = you owe them
          person: l.person,
          amount: Number(l.amount) || 0,
          due_date: l.due_date,
        })),
    },
    transactionCount: txs.length,
    transactionsTruncated: txs.length > MAX_TX,
    transactions: recent,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const messages: ChatMessage[] = Array.isArray(body?.messages)
    ? body.messages
    : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const [profile, budgets, loans] = await Promise.all([
    getProfile(supabase, user.id),
    getBudgets(supabase, user.id),
    getLoans(supabase, user.id),
  ]);
  const { currency, timezone } = profile ?? profileDefaults();
  const userName = profile?.name ?? "";

  const txs = (data ?? []) as Transaction[];
  const context = buildContext(txs, budgets, loans, currency, timezone);

  const system = `You are the in-app financial assistant for a personal expense tracker.
Answer the user's questions using ONLY the JSON data below about THEIR transactions. Do not invent transactions or numbers.

User Information
Name: ${userName || "(unknown)"}
Default Currency: ${currency}
Timezone: ${timezone}
Address the user by their first name occasionally and keep a warm, personal tone.

Rules:
- All amounts are in ${context.currency}. Always include the currency in figures.
- Do NOT do your own arithmetic over the raw transactions. Read the answer from the pre-computed aggregates:
  - "how much did I spend on X this month" -> spendingThisMonthByCategory (match category X); last month -> spendingLastMonthByCategory.
  - overall/all-time category totals -> spendingByCategoryAllTime.
  - comparisons/increases between months -> thisVsLastMonthByCategory (has thisMonth, lastMonth, changePct).
  - overall monthly totals -> totals and last6MonthsExpense.
  - budget questions ("how's my food budget", "am I over budget") -> budgets (each has category, limit, spent, remaining, pct, status).
  - loan/debt questions ("how much do I owe", "who owes me", "does X owe me") -> loans (summary.owedToYou, summary.youOwe; outstanding[] has direction "lent"=they owe the user / "borrowed"=user owes them, person, amount, due_date).
- Use the raw "transactions" list only for detail lookups (e.g. "show all Netflix payments", "did I pay the electricity bill").
- Match categories/merchants case-insensitively and by meaning (e.g. "Netflix" may appear under category "Subscriptions" or in a description).
- Be concise and friendly. Give the final figure directly — do not show calculation steps. Use short sentences or small bullet lists. Round money to whole numbers.
- If the data does not contain the answer, say so plainly instead of guessing.
- Today's date is ${context.today}. "This month" means the current calendar month.
${context.transactionsTruncated ? `- Note: only the ${MAX_TX} most recent of ${context.transactionCount} transactions are included; mention this if the user asks about older data.` : ""}

DATA:
${JSON.stringify(context)}`;

  const trimmed = messages.slice(-MAX_HISTORY);

  let response;
  try {
    response = await createChatCompletion({
      model: CHAT_MODEL,
      temperature: 0.2,
      max_tokens: 600,
      messages: [{ role: "system", content: system }, ...trimmed],
    });
  } catch (err) {
    console.error("Chat request failed", err);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Try again shortly." },
      { status: 502 }
    );
  }

  const reply =
    response.choices[0]?.message?.content?.trim() ||
    "Sorry, I couldn't come up with an answer.";

  return NextResponse.json({ reply });
}
