import type { SupabaseClient } from "@supabase/supabase-js";
import type { Budget } from "./types";

export async function getBudgets(
  supabase: SupabaseClient,
  userId: string
): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  // Table may not exist yet (before the SQL migration is run) — fail soft.
  if (error) return [];
  return (data ?? []) as Budget[];
}
