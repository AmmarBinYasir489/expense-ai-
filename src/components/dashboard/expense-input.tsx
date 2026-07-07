"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ExpenseInput() {

  const router = useRouter();

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);


  async function submitExpense() {

    if (!text.trim()) {
      alert("Please enter an expense");
      return;
    }


    try {

      setLoading(true);


      const aiResponse = await fetch(
        "/api/ai/transaction/parse",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text,
          }),
        }
      );


      const transaction =
        await aiResponse.json();


      if (!aiResponse.ok) {

        alert(transaction.error || "AI parsing failed");

        return;
      }



      const saveResponse =
        await fetch(
          "/api/transactions/create",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(transaction),
          }
        );



      const saved =
        await saveResponse.json();



      if (saveResponse.ok) {

        alert("Expense saved!");

        setText("");

        // Refresh dashboard server components
        router.refresh();

      } else {

        alert(saved.error || "Saving failed");

      }


    } catch (error) {

      console.error(error);

      alert("Something went wrong");

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h2 className="text-xl font-semibold mb-4">
        Add Expense
      </h2>


      <textarea

        value={text}

        onChange={(e) => setText(e.target.value)}

        placeholder="Example: Bought coffee for 500 today"

        className="w-full rounded-xl border p-4"

        rows={4}

      />


      <button

        onClick={submitExpense}

        disabled={loading}

        className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 text-white disabled:opacity-50"

      >

        {loading
          ? "Processing..."
          : "Add Expense"
        }

      </button>


    </div>

  );
}

