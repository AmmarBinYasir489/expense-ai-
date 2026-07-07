import { NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";
import { transactionSchema } from "@/lib/validators/transaction";

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Please enter an expense." },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a finance assistant that turns a short natural-language note into a single structured transaction.

Today's date is ${today}.

Rules:
- "type" is "income" for money received (salary, refund, sold, got paid) and "expense" for money spent.
- "amount" is a positive number only (no currency symbols).
- "category" is a short Title Case label (e.g. Food, Transport, Shopping, Rent, Salary, Utilities, Health, Entertainment).
- "description" is a brief human-readable summary of the note.
- "date" is YYYY-MM-DD; if the note says "today" or gives no date, use ${today}. Resolve "yesterday" relative to today.
- "confidence" is between 0 and 1 reflecting how sure you are.

Return ONLY this JSON object and nothing else:
{"type":"expense|income","amount":number,"category":"string","description":"string","date":"YYYY-MM-DD","confidence":number}`,
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

  let result: unknown;
  try {
    result = JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    return NextResponse.json(
      { error: "AI returned an unreadable response. Try rephrasing." },
      { status: 400 }
    );
  }

  const validated = transactionSchema.safeParse(result);

  if (!validated.success) {
    return NextResponse.json(
      { error: "Couldn't understand that. Try e.g. 'Coffee 500 today'." },
      { status: 400 }
    );
  }

  return NextResponse.json(validated.data);
}
