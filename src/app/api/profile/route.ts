import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupportedCurrency } from "@/lib/format";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const currency = typeof body?.currency === "string" ? body.currency : "";
  const timezone = typeof body?.timezone === "string" ? body.timezone : "";

  if (name.length < 1 || name.length > 60) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!isSupportedCurrency(currency)) {
    return NextResponse.json(
      { error: "Please choose a valid currency." },
      { status: 400 }
    );
  }
  if (!timezone) {
    return NextResponse.json(
      { error: "Please choose your timezone." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, name, currency, timezone });

  if (error) {
    console.error("Profile upsert failed", error);
    return NextResponse.json(
      {
        error:
          "Could not save your profile. If this persists, check the profiles table RLS policies.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
