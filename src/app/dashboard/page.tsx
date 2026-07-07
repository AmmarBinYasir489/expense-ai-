import ExpenseInput from "@/components/dashboard/expense-input";
import TransactionList from "@/components/dashboard/transaction-list";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/logout-button";


export default async function DashboardPage() {

  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();


  if (!user) {
    redirect("/login");
  }


  return (
    <main className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-8">

          <h1 className="text-3xl font-bold">
            Expense AI Dashboard
          </h1>


          <p className="mt-3 text-gray-500">
            Logged in as:{" "}
            {user.email}
          </p>


          <div className="mt-8">
            <DashboardStats />
          </div>


          <div className="mt-8">
            <ExpenseInput />
          </div>


          <div className="mt-8">
            <TransactionList />
          </div>


          <div className="mt-8">
            <LogoutButton />
          </div>

        </div>

      </div>

    </main>
  );
}