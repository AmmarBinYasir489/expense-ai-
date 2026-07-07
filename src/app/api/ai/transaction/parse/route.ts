import { NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";
import { transactionSchema } from "@/lib/validators/transaction";


export async function POST(request: Request) {

  const { text } = await request.json();


  const response = await openai.chat.completions.create({

  model: "llama-3.1-8b-instant",

  max_tokens: 500,

  response_format: {
    type: "json_object",
  },

  messages: [
    {
      role: "system",
      content: `
You are an expense tracking AI.

Return only JSON:

{
"type":"expense",
"amount":number,
"category":"string",
"description":"string",
"date":"YYYY-MM-DD",
"confidence":number
}
`,
    },
    {
      role: "user",
      content: text,
    },
  ],
});



  const result = JSON.parse(
    response.choices[0].message.content || "{}"
  );


  const validated =
    transactionSchema.safeParse(result);



  if (!validated.success) {

    return NextResponse.json(
      {
        error: "Invalid AI response",
      },
      {
        status: 400,
      }
    );

  }


  return NextResponse.json(
    validated.data
  );

}