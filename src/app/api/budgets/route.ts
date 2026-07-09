import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCategory } from "@/lib/categories";

// Create or update a monthly budget for a category (one per category per user).
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const category = normalizeCategory(
    typeof body?.category === "string" ? body.category : ""
  );
  const amount = Number(body?.amount);

  if (!category || category === "Other") {
    return NextResponse.json(
      { error: "Please choose a category." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Enter a budget amount greater than 0." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, category, amount },
      { onConflict: "user_id,category" }
    )
    .select()
    .single();

  if (error) {
    console.error("Budget upsert failed", error);
    return NextResponse.json(
      {
        error:
          "Could not save the budget. Make sure the budgets table exists (run supabase/budgets.sql).",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}
