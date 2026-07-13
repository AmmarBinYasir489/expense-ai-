import { z } from "zod";

export const loanCreateSchema = z.object({
  direction: z.enum(["lent", "borrowed"]),
  person: z.string().trim().min(1).max(80),
  amount: z.number().positive(),
  due_date: z.string().min(1).nullable().optional(),
  description: z.string().max(200).nullable().optional(),
});

export const loanEditSchema = z.object({
  direction: z.enum(["lent", "borrowed"]).optional(),
  person: z.string().trim().min(1).max(80).optional(),
  amount: z.number().positive().optional(),
  due_date: z.string().min(1).nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  status: z.enum(["outstanding", "repaid"]).optional(),
});
