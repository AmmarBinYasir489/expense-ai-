import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const transactions = (data ?? []) as Transaction[];

  return (
    <DashboardShell email={user.email ?? ""} transactions={transactions} />
  );
}
