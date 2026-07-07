import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),

  amount: z.number()
    .positive(),

  category: z.string(),

  description: z.string(),

  date: z.string(),

  confidence: z.number()
    .min(0)
    .max(1),
});


export type Transaction = z.infer<
  typeof transactionSchema
>;