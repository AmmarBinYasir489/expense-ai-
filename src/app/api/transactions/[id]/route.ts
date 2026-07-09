import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionEditSchema } from "@/lib/validators/transaction";
import { normalizeCategory } from "@/lib/categories";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = transactionEditSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid transaction data" },
      { status: 400 }
    );
  }

  const { type, amount, category, description, date } = parsed.data;

  const { data, error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      category: normalizeCategory(category),
      description,
      date,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
