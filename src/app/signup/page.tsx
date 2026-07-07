"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";


export default function SignupPage() {

  const router = useRouter();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");



  async function signup(e: React.FormEvent) {

    e.preventDefault();


    setLoading(true);
    setError("");
    setSuccess("");



    // Password validation

    if (password.length < 8) {

      setError(
        "Password must be at least 8 characters"
      );

      setLoading(false);
      return;

    }


    if (!/[A-Z]/.test(password)) {

      setError(
        "Password must contain at least one uppercase letter"
      );

      setLoading(false);
      return;

    }


    if (!/[0-9]/.test(password)) {

      setError(
        "Password must contain at least one number"
      );

      setLoading(false);
      return;

    }



    const {
      data,
      error
    } = await supabase.auth.signUp({

      email,
      password,

    });



    if (error) {


      if (
        error.message
          .toLowerCase()
          .includes("already registered")
      ) {

        setError(
          "An account with this email already exists. Please login."
        );


      } else {

        setError(error.message);

      }


      setLoading(false);
      return;

    }




    // Email confirmation enabled

    if (!data.session) {

      setSuccess(
        "Account created. Please check your email and verify your account before logging in."
      );

      setLoading(false);
      return;

    }




    // If email confirmation is disabled

    router.push("/dashboard");

  }




  return (

    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">


      <div className="w-full max-w-md">


        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">


          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              Create your account
            </h1>


            <p className="mt-2 text-gray-500">
              Start tracking your expenses with AI
            </p>

          </div>




          {error && (

            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}




          {success && (

            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">

              {success}

            </div>

          )}






          <form
            onSubmit={signup}
            className="space-y-5"
          >



            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>


              <input

                type="email"

                placeholder="you@example.com"

                value={email}

                onChange={(e)=>setEmail(e.target.value)}

                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"

                required

              />

            </div>





            <div>


              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>



              <div className="relative">


                <input

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  placeholder="Create a strong password"

                  value={password}

                  onChange={(e)=>setPassword(e.target.value)}

                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"

                  required

                  minLength={8}

                />




                <button

                  type="button"

                  onClick={() =>
                    setShowPassword(!showPassword)
                  }

                  className="absolute right-4 top-3 text-gray-500 hover:text-indigo-600 transition"

                  aria-label={
                    showPassword
                    ? "Hide password"
                    : "Show password"
                  }

                >

                  {showPassword ? (

                    <EyeOff size={20}/>

                  ) : (

                    <Eye size={20}/>

                  )}

                </button>


              </div>



              <p className="mt-2 text-xs text-gray-400">
                Minimum 8 characters, 1 uppercase letter, and 1 number
              </p>


            </div>






            <button

              disabled={loading}

              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"

            >

              {loading
                ? "Creating account..."
                : "Create Account"
              }


            </button>



          </form>





          <p className="mt-6 text-center text-sm text-gray-500">


            Already have an account?{" "}


            <a

              href="/login"

              className="font-medium text-indigo-600 hover:text-indigo-700"

            >

              Login

            </a>


          </p>



        </div>




        <p className="mt-6 text-center text-xs text-gray-400">

          Secure authentication powered by Supabase

        </p>



      </div>


    </main>

  );

}