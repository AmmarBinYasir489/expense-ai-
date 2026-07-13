import type { SupabaseClient } from "@supabase/supabase-js";
import type { Loan } from "./types";

export async function getLoans(
  supabase: SupabaseClient,
  userId: string
): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Table may not exist yet (before the SQL migration is run) — fail soft.
  if (error) return [];
  return (data ?? []) as Loan[];
}

export type LoanSummary = {
  owedToYou: number; // outstanding money others owe you (lent)
  youOwe: number; // outstanding money you owe others (borrowed)
  net: number; // owedToYou - youOwe
};

export function loanSummary(loans: Loan[]): LoanSummary {
  let owedToYou = 0;
  let youOwe = 0;
  for (const l of loans) {
    if (l.status !== "outstanding") continue;
    const amt = Number(l.amount) || 0;
    if (l.direction === "lent") owedToYou += amt;
    else youOwe += amt;
  }
  return { owedToYou, youOwe, net: owedToYou - youOwe };
}
