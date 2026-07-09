import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isProfileComplete } from "@/lib/profile";
import { getBudgets } from "@/lib/budgets";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { Transaction } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);
  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  const [{ data }, budgets] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getBudgets(supabase, user.id),
  ]);

  const transactions = (data ?? []) as Transaction[];

  return (
    <DashboardShell
      email={user.email ?? ""}
      name={profile!.name}
      currency={profile!.currency || "PKR"}
      transactions={transactions}
      budgets={budgets}
    />
  );
}
