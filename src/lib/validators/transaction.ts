import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string(),
  date: z.string(),
  confidence: z.number().min(0).max(1),
});

// The AI may return one or many transactions from a single note.
export const parsedTransactionsSchema = z.object({
  transactions: z.array(transactionSchema).min(1).max(20),
});

// A loan/debt the AI infers from a bill-splitting note.
export const aiLoanSchema = z.object({
  direction: z.enum(["lent", "borrowed"]),
  person: z.string().trim().min(1).max(80),
  amount: z.number().positive(),
  description: z.string().nullable().optional(),
});

// A note can yield expenses/income AND loans (e.g. splitting a bill).
export const parsedEntriesSchema = z.object({
  transactions: z.array(transactionSchema).max(20).default([]),
  loans: z.array(aiLoanSchema).max(20).default([]),
});

export type AiLoan = z.infer<typeof aiLoanSchema>;

// Ensure both keys exist regardless of what shape the model returned.
export function normalizeToEntries(raw: unknown): unknown {
  if (Array.isArray(raw)) return { transactions: raw, loans: [] };
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return {
      transactions: Array.isArray(o.transactions) ? o.transactions : [],
      loans: Array.isArray(o.loans) ? o.loans : [],
    };
  }
  return { transactions: [], loans: [] };
}

export type ParsedTransaction = z.infer<typeof transactionSchema>;

// Fields a user can edit on an existing transaction.
export const transactionEditSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional().default(""),
  date: z.string().min(1),
});

// Accepts a bare object, a bare array, or the { transactions: [...] } wrapper
// and normalizes to the wrapper shape before validation.
export function normalizeToTransactions(raw: unknown): unknown {
  if (Array.isArray(raw)) return { transactions: raw };
  if (raw && typeof raw === "object" && "transactions" in raw) return raw;
  return { transactions: [raw] };
}
