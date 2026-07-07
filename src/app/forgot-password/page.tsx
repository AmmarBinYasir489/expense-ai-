"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";


export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function sendResetEmail() {

    setLoading(true);
    setMessage("");


    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      );


    if (error) {

      setMessage(error.message);

    } else {

      setMessage(
        "Reset email sent. Check your inbox."
      );

    }


    setLoading(false);

  }


  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold">
          Forgot Password
        </h1>


        <p className="mt-2 text-gray-500">
          Enter your email to receive a reset link.
        </p>


        <input

          type="email"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

          placeholder="you@example.com"

          className="mt-6 w-full rounded-xl border px-4 py-3"

        />


        <button

          onClick={sendResetEmail}

          disabled={loading}

          className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-white"

        >

          {loading
            ? "Sending..."
            : "Send Reset Link"
          }

        </button>


        {message && (

          <p className="mt-4 text-sm">
            {message}
          </p>

        )}

      </div>

    </main>

  );

}