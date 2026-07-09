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
