import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, PieChart, ShieldCheck, ArrowRight } from "lucide-react";

export default async function Home() {
  // If already signed in, skip the marketing page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-background">
            <Sparkles size={18} />
          </span>
          Expense AI
        </div>
        <Link
          href="/login"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <Sparkles size={14} className="text-accent" />
          Powered by AI expense parsing
        </span>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Track money by
          <br />
          <span className="text-accent">just typing it.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
          Write &ldquo;Bought coffee for 500 today&rdquo; and let AI categorize
          it. See your balance, charts, and smart insights — all on one screen.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 font-semibold text-background transition hover:brightness-110"
          >
            Get started free
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-border px-7 font-semibold text-foreground transition hover:bg-surface"
          >
            I have an account
          </Link>
        </div>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          <Feature
            icon={<Sparkles size={20} />}
            title="Natural language"
            body="No forms. Type expenses like you'd text a friend."
          />
          <Feature
            icon={<PieChart size={20} />}
            title="Live insights"
            body="Charts and tips update the moment you add spending."
          />
          <Feature
            icon={<ShieldCheck size={20} />}
            title="Private & secure"
            body="Your data is protected with Supabase auth."
          />
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center text-xs text-muted">
        Built with Next.js · Supabase · Groq
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5 text-left">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-accent">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
