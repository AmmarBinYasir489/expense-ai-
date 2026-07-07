// src/components/dashboard/transaction-list.tsx

import { createClient } from "@/lib/supabase/server";

export default async function TransactionList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        Failed to load transactions.
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div>
        No transactions yet.
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">
        Recent Transactions
      </h2>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border rounded-lg p-4 flex justify-between"
          >
            <div>
              <h3 className="font-medium">
                {transaction.category}
              </h3>

              <p className="text-sm text-gray-500">
                {transaction.description}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold">
                {transaction.amount} PKR
              </p>

              <span
                className={
                  transaction.type === "expense"
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {transaction.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}