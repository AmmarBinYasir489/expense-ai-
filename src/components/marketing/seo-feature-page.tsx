import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

type FeaturePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  benefits: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function SeoFeaturePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  benefits,
  sections,
}: FeaturePageProps) {
  return (
    <main className="landing-page min-h-screen">
      <header className="landing-nav">
        <div className="landing-container flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-background">
              <CircleDollarSign size={20} />
            </span>
            Expense AI
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-sm text-muted lg:flex"
          >
            <Link href="/ai-expense-tracker" className="landing-nav-link">
              AI tracker
            </Link>
            <Link href="/budget-tracker" className="landing-nav-link">
              Budgets
            </Link>
            <Link
              href="/personal-loan-tracker"
              className="landing-nav-link"
            >
              Loans
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href="/signup" className="landing-button landing-button-small">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-section">
        <div className="landing-container grid items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
          <div>
            <p className="landing-kicker">{eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight tracking-[-0.04em] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {description}
            </p>
            <Link href="/signup" className="landing-button mt-8">
              Start tracking for free
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Icon size={24} />
            </span>
            <ul className="mt-7 space-y-4">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 leading-7 text-muted"
                >
                  <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check size={13} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-muted">
        <div className="landing-container">
          <div className="grid gap-5 md:grid-cols-3">
            {sections.map((section) => (
              <article key={section.title} className="landing-feature-card">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-3 leading-7 text-muted">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Clearer money tracking starts with one entry
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">
            Create an account and use the same Expense AI dashboard for
            transactions, budgets, loans, charts, and financial questions.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/ai-expense-tracker" className="text-accent">
              AI expense tracking
            </Link>
            <Link href="/budget-tracker" className="text-accent">
              Monthly budgets
            </Link>
            <Link href="/personal-loan-tracker" className="text-accent">
              Personal loans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
