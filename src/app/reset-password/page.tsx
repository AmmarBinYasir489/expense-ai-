"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function ResetPasswordPage() {

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);



  async function updatePassword() {


    if (!password || !confirmPassword) {

      setMessage("Please fill all fields");
      return;

    }


    if (password !== confirmPassword) {

      setMessage("Passwords do not match");
      return;

    }


    if (password.length < 6) {

      setMessage(
        "Password must be at least 6 characters"
      );

      return;

    }



    setLoading(true);



    const { error } =
      await supabase.auth.updateUser({
        password,
      });



    if (error) {

      setMessage(error.message);

    } else {

      setMessage(
        "Password updated successfully"
      );


      setTimeout(() => {

        router.push("/login");

      }, 1500);

    }


    setLoading(false);

  }



  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">


        <h1 className="text-2xl font-bold">
          Reset Password
        </h1>


        <p className="mt-2 text-gray-500">
          Enter your new password.
        </p>



        <input

          type="password"

          placeholder="New password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

          className="mt-6 w-full rounded-xl border px-4 py-3"

        />



        <input

          type="password"

          placeholder="Confirm password"

          value={confirmPassword}

          onChange={(e)=>setConfirmPassword(e.target.value)}

          className="mt-4 w-full rounded-xl border px-4 py-3"

        />



        <button

          onClick={updatePassword}

          disabled={loading}

          className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-white"

        >

          {loading
            ? "Updating..."
            : "Update Password"
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