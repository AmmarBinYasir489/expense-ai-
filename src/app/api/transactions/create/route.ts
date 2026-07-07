import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parsedTransactionsSchema,
  normalizeToTransactions,
} from "@/lib/validators/transaction";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Accept a single transaction, a bare array, or { transactions: [...] }.
    // Re-validate on the server — never trust the client payload.
    const validated = parsedTransactionsSchema.safeParse(
      normalizeToTransactions(body)
    );

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid transaction data" },
        { status: 400 }
      );
    }

    const rows = validated.data.transactions.map((t) => ({
      user_id: user.id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
      confidence: t.confidence,
    }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ transactions: data, count: data.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
