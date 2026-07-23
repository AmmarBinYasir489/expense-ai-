import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CircleDollarSign,
  Download,
  HandCoins,
  LockKeyhole,
  MessageCircleMore,
  PieChart,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  WalletCards,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: MessageCircleMore,
    title: "Add expenses naturally",
    body: "Type a note like “Lunch 850 today” and Expense AI turns it into a clean, categorized transaction.",
    tone: "green",
  },
  {
    icon: PieChart,
    title: "See where money goes",
    body: "Understand your spending with category breakdowns, monthly trends, and a clear balance overview.",
    tone: "violet",
  },
  {
    icon: Target,
    title: "Stay inside your budget",
    body: "Set category limits and see how much you have spent, what remains, and where you are getting close.",
    tone: "blue",
  },
  {
    icon: HandCoins,
    title: "Track loans and shared bills",
    body: "Keep a simple record of who owes you, what you borrowed, and which personal debts have been repaid.",
    tone: "amber",
  },
  {
    icon: Bot,
    title: "Ask your financial data",
    body: "Ask questions about your own records and receive concise answers based on your actual transactions.",
    tone: "green",
  },
  {
    icon: Download,
    title: "Export your records",
    body: "Download your transaction history as CSV whenever you need a copy for analysis or record keeping.",
    tone: "violet",
  },
];

const faqs = [
  {
    question: "What is Expense AI?",
    answer:
      "Expense AI is a personal expense tracker that lets you record spending in everyday language. It organizes transactions, shows charts, tracks budgets and personal loans, and provides AI-assisted insights.",
  },
  {
    question: "How does AI expense tracking work?",
    answer:
      "You describe a transaction in a short sentence. Expense AI identifies the amount, date, transaction type, description, and a sensible category before saving it to your private account.",
  },
  {
    question: "Can I track income as well as expenses?",
    answer:
      "Yes. You can record both income and expenses, then see your total income, total spending, current balance, and recent monthly trends.",
  },
  {
    question: "Can Expense AI track money I lend or borrow?",
    answer:
      "Yes. The loans and debts section tracks money you lent, money you borrowed, the other person, optional due dates, and repayment status.",
  },
  {
    question: "Is my financial data private?",
    answer:
      "Your account is protected by authentication and database row-level access controls so each user can access only their own financial records.",
  },
  {
    question: "Do I need to install an app?",
    answer:
      "No. Expense AI works in a modern web browser on desktop and mobile. Create an account, complete the short setup, and start tracking.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  const siteUrl = getSiteUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: siteUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description:
        "An AI-powered personal expense tracker for transactions, budgets, loans, charts, and spending insights.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Natural-language expense tracking",
        "Income and spending dashboard",
        "Monthly category budgets",
        "Personal loan and debt tracking",
        "AI-powered financial questions",
        "CSV transaction export",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: "Wallet Expense AI",
      url: siteUrl,
      description:
        "A free web-based AI expense tracker, monthly budget tracker, and personal loan manager.",
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <main className="landing-page overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="landing-nav">
        <div className="landing-container flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <BrandMark />
            <span>Expense AI</span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 text-sm text-muted xl:flex"
          >
            <Link href="/ai-expense-tracker" className="landing-nav-link">
              AI tracker
            </Link>
            <Link href="/budget-tracker" className="landing-nav-link">
              Budgets
            </Link>
            <Link href="/personal-loan-tracker" className="landing-nav-link">
              Loans
            </Link>
            <a href="#how-it-works" className="landing-nav-link">
              How it works
            </a>
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#security" className="landing-nav-link">
              Security
            </a>
            <a href="#faq" className="landing-nav-link">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground sm:px-4"
            >
              Sign in
            </Link>
            <Link href="/signup" className="landing-button landing-button-small">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-grid-glow" aria-hidden />
        <div className="landing-container relative z-10 grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-24">
          <div>
            <div className="landing-eyebrow">
              <Sparkles size={14} />
              AI-powered personal finance
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Your spending,
              <span className="landing-gradient-text block">finally clear.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Record expenses in plain language, follow your budgets, track
              personal loans, and understand your money from one calm dashboard.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="landing-button">
                Start tracking for free
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="landing-button-secondary">
                See how it works
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2">
                <Check size={16} className="text-accent" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-accent" />
                Works in your browser
              </span>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section className="border-y border-border/70 bg-surface/40">
        <div className="landing-container grid gap-6 py-7 text-center sm:grid-cols-3 sm:text-left">
          <ProofPoint
            icon={Zap}
            title="Fast to record"
            body="One sentence instead of a long form"
          />
          <ProofPoint
            icon={BarChart3}
            title="Easy to understand"
            body="Useful totals, trends, and categories"
          />
          <ProofPoint
            icon={LockKeyhole}
            title="Private by design"
            body="Your account, your financial records"
          />
        </div>
      </section>

      <section id="how-it-works" className="landing-section">
        <div className="landing-container">
          <SectionHeading
            eyebrow="How it works"
            title="From a quick note to a useful money picture"
            body="Expense tracking should take seconds. The organization and analysis happen after you type."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <Step
              number="01"
              icon={ReceiptText}
              title="Describe the transaction"
              body="Type something natural, such as “Paid 2,400 for groceries yesterday.”"
            />
            <Step
              number="02"
              icon={Sparkles}
              title="AI organizes the details"
              body="The amount, date, type, description, and category are structured for you."
            />
            <Step
              number="03"
              icon={TrendingDown}
              title="See your money clearly"
              body="Your balance, charts, budgets, history, and insights update in one place."
            />
          </div>
        </div>
      </section>

      <section id="features" className="landing-section landing-section-muted">
        <div className="landing-container">
          <SectionHeading
            eyebrow="Everything in one place"
            title="A practical toolkit for everyday finances"
            body="Built around the money tasks people actually repeat: recording, reviewing, budgeting, and keeping track of what is owed."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="landing-feature-card">
                  <span
                    className={`landing-feature-icon landing-feature-icon-${feature.tone}`}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-7 text-muted">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container grid items-center gap-14 lg:grid-cols-2">
          <div className="landing-insight-card" aria-label="AI insights preview">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">AI insight</p>
                <p className="mt-1 font-semibold">Your monthly spending</p>
              </div>
              <span className="landing-feature-icon landing-feature-icon-green">
                <Bot size={21} />
              </span>
            </div>
            <div className="mt-8 flex h-40 items-end gap-3">
              {[36, 52, 44, 72, 61, 48].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-xl bg-accent/70"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-4">
              <p className="text-sm leading-6">
                Your spending is lower than last month. Groceries remain your
                largest category.
              </p>
            </div>
          </div>

          <div>
            <p className="landing-kicker">Ask, understand, decide</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Get answers grounded in your own records
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted">
              Ask what you spent this month, which category increased, whether
              you are near a budget, or who still owes you. Expense AI uses your
              saved data to answer directly.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                "What did I spend on food this month?",
                "Am I over my transport budget?",
                "How much do I owe, and who owes me?",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check size={13} />
                  </span>
                  “{item}”
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="security" className="landing-section pt-0">
        <div className="landing-container">
          <div className="landing-security">
            <div>
              <div className="landing-eyebrow">
                <ShieldCheck size={14} />
                Security
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Financial tracking should feel private
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Secure authentication protects access to your account, while
                database row-level controls isolate each user&apos;s records.
                Your dashboard is available only after you sign in.
              </p>
            </div>
            <ShieldCheck className="hidden text-accent/70 md:block" size={82} />
          </div>
        </div>
      </section>

      <section id="faq" className="landing-section landing-section-muted">
        <div className="landing-container grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="landing-kicker">Frequently asked questions</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              A clearer start
            </h2>
            <p className="mt-5 leading-7 text-muted">
              Everything you need to know before creating your account.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="landing-faq">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-cta">
            <div className="relative z-10">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-background">
                <WalletCards size={24} />
              </div>
              <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Make your money easier to understand
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
                Start with one transaction. Expense AI will help turn the habit
                into a clearer view of your finances.
              </p>
              <Link href="/signup" className="landing-button mt-8">
                Create your free account
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="landing-container flex flex-col items-center gap-6 py-10 text-center text-sm text-muted">
          <div className="flex items-center gap-2.5 text-foreground">
            <BrandMark />
            <span className="font-semibold">Expense AI</span>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-center gap-3"
          >
            <Link
              href="/ai-expense-tracker"
              className="hover:text-foreground"
            >
              AI tracker
            </Link>
            <Link href="/budget-tracker" className="hover:text-foreground">
              Budgets
            </Link>
            <Link
              href="/personal-loan-tracker"
              className="hover:text-foreground"
            >
              Loans
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Create account
            </Link>
          </nav>
          <p>© {new Date().getFullYear()} Expense AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function BrandMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-background shadow-[0_0_24px_rgba(74,222,128,0.2)]">
      <CircleDollarSign size={20} />
    </span>
  );
}

function DashboardPreview() {
  return (
    <div className="landing-dashboard-wrap">
      <div className="landing-dashboard">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BrandMark />
            <span className="text-sm font-semibold">Overview</span>
          </div>
          <div className="h-8 w-8 rounded-full border border-border bg-surface-2" />
        </div>
        <div className="p-5">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-2 p-5">
            <p className="text-xs text-muted">Current balance</p>
            <p className="mt-2 text-3xl font-bold">$8,420.00</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <PreviewStat label="Income" value="$12.5k" tone="text-accent" />
              <PreviewStat label="Expenses" value="$4.1k" tone="text-danger" />
              <PreviewStat label="This month" value="$1.8k" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Spending trend</p>
                <span className="text-[10px] text-muted">6 months</span>
              </div>
              <div className="mt-6 flex h-24 items-end gap-2">
                {[42, 62, 51, 78, 66, 45].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-t-md bg-accent/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-medium">Budgets</p>
              <PreviewBudget label="Food" value="68%" width="68%" />
              <PreviewBudget label="Transport" value="42%" width="42%" />
              <PreviewBudget label="Shopping" value="81%" width="81%" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-xs text-muted">AI insight</p>
              <p className="mt-0.5 text-sm">
                You spent 14% less than last month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  tone = "",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-background/50 p-2.5">
      <p className="text-[10px] text-muted">{label}</p>
      <p className={`mt-1 text-xs font-semibold sm:text-sm ${tone}`}>{value}</p>
    </div>
  );
}

function PreviewBudget({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width }} />
      </div>
    </div>
  );
}

function ProofPoint({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Zap;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3 sm:justify-start">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
        <Icon size={19} />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{body}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="landing-kicker">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-muted">{body}</p>
    </div>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  body,
}: {
  number: string;
  icon: typeof ReceiptText;
  title: string;
  body: string;
}) {
  return (
    <article className="landing-step">
      <div className="flex items-center justify-between">
        <span className="landing-feature-icon landing-feature-icon-green">
          <Icon size={22} />
        </span>
        <span className="text-sm font-semibold text-muted/60">{number}</span>
      </div>
      <h3 className="mt-8 text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-muted">{body}</p>
    </article>
  );
}
