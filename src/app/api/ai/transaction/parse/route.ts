import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/ai/openai";
import {
  parsedEntriesSchema,
  normalizeToEntries,
} from "@/lib/validators/transaction";
import { normalizeCategory } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import { getProfile, profileDefaults } from "@/lib/profile";
import { todayInTimezone } from "@/lib/datetime";

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Please enter an expense." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getProfile(supabase, user.id) : null;
  const { currency, timezone } = profile ?? profileDefaults();
  const userName = profile?.name ?? "";

  const today = todayInTimezone(timezone);

  let response;
  try {
    response = await createChatCompletion({
      model: "gemini-2.5-flash-lite",
      max_tokens: 900,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a finance assistant that turns a natural-language note into one or more structured transactions.

User Information
Name: ${userName || "(unknown)"}
Default Currency: ${currency}
Timezone: ${timezone}
Today's date (in the user's timezone) is ${today}.

Amounts are in the user's default currency (${currency}) unless the note clearly states otherwise; do not convert currencies.

A single note may contain several transactions (e.g. "Paid 350 for lunch, 1500 on Netflix, and 3000 for books" is THREE separate transactions). Split them into one object each — never merge amounts.

For each transaction:
- "type" is "income" for money received (salary, refund, sold, got paid) and "expense" for money spent.
- "amount" is a positive number only (no currency symbols).
- "category": decide this yourself from the meaning of the sentence. Categorize by what the amount was actually paid FOR (the action or thing the money bought), not by unrelated nouns in the sentence. For example, if the payment is a cab/ride fare to reach a place, it is transport even if the destination is a food spot. Use a concise, natural Title Case label of your own choosing — there is no fixed list.
- "description" is a brief human-readable summary of that item.
- "date" is YYYY-MM-DD; if the note says "today" or gives no date, use ${today}. Resolve "yesterday" relative to today.
- "confidence" is between 0 and 1.

LOANS / SPLITTING A BILL:
If the note involves lending, borrowing, or splitting a shared cost, also output "loans". Rules:
- When the USER paid a shared bill and someone else will pay them back their share: create a loan with "direction":"lent" for that person and their share as "amount". The user's own EXPENSE "amount" must be the total MINUS everyone else's shares (only the user's own portion). Example: "me and Ali bought groceries for 6000, I paid, Ali will pay me 2000" -> transactions:[{expense, amount:4000, category:"Groceries"...}], loans:[{"direction":"lent","person":"Ali","amount":2000}].
- When SOMEONE ELSE paid and the USER owes them: create ONLY a "borrowed" loan and leave "transactions" EMPTY — the user did not spend their own money yet, so there is NO expense. Example: "Ali paid 6000 for groceries, I owe him 2000" -> {"transactions":[],"loans":[{"direction":"borrowed","person":"Ali","amount":2000}]}. Never output an expense alongside a borrowed loan for the same payment.
- For each loan: "person" is the other person's name, "amount" is positive, "description" is a short note (optional).
- If there is no lending/borrowing/splitting, "loans" is an empty array.

Return ONLY this JSON object and nothing else:
{"transactions":[{"type":"expense|income","amount":number,"category":"string","description":"string","date":"YYYY-MM-DD","confidence":number}],"loans":[{"direction":"lent|borrowed","person":"string","amount":number,"description":"string"}]}`,
        },
        { role: "user", content: text },
      ],
    });
  } catch (err) {
    console.error("AI request failed", err);
    return NextResponse.json(
      { error: "AI service is unavailable. Try again shortly." },
      { status: 502 }
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    return NextResponse.json(
      { error: "AI returned an unreadable response. Try rephrasing." },
      { status: 400 }
    );
  }

  const validated = parsedEntriesSchema.safeParse(normalizeToEntries(raw));

  if (
    !validated.success ||
    (validated.data.transactions.length === 0 &&
      validated.data.loans.length === 0)
  ) {
    return NextResponse.json(
      { error: "Couldn't understand that. Try e.g. 'Coffee 500 today'." },
      { status: 400 }
    );
  }

  // Collapse synonymous categories to a canonical label so charts stay clean.
  const transactions = validated.data.transactions.map((t) => ({
    ...t,
    category: normalizeCategory(t.category),
  }));

  return NextResponse.json({ transactions, loans: validated.data.loans });
}
