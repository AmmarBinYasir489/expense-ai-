import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, profileDefaults } from "@/lib/profile";
import { loanCreateSchema } from "@/lib/validators/loan";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = loanCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a name and an amount greater than 0." },
      { status: 400 }
    );
  }

  const profile = await getProfile(supabase, user.id);
  const currency = profile?.currency ?? profileDefaults().currency;

  const { direction, person, amount, due_date, description } = parsed.data;

  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_id: user.id,
      direction,
      person,
      amount,
      currency,
      due_date: due_date || null,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Loan insert failed", error);
    return NextResponse.json(
      {
        error:
          "Could not save. Make sure the loans table exists (run supabase/loans.sql).",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}
