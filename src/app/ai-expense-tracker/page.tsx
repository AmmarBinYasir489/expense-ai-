import type { Metadata } from "next";
import { MessageCircleMore } from "lucide-react";
import SeoFeaturePage from "@/components/marketing/seo-feature-page";

export const metadata: Metadata = {
  title: "Free AI Expense Tracker",
  description:
    "Use a free AI expense tracker to record spending in plain language, categorize transactions, review charts, and export your expense history.",
  alternates: { canonical: "/ai-expense-tracker" },
};

export default function AiExpenseTrackerPage() {
  return (
    <SeoFeaturePage
      eyebrow="AI expense tracker"
      title="Track expenses by describing what you spent"
      description="Expense AI turns short, everyday money notes into organized income and expense records. Spend less time filling forms and more time understanding where your money goes."
      icon={MessageCircleMore}
      benefits={[
        "Record one or several transactions from a natural-language note.",
        "Organize each amount by type, date, description, and category.",
        "Review spending charts, search transaction history, and export CSV.",
      ]}
      sections={[
        {
          title: "Plain-language entry",
          body: "Write a note such as “Lunch 850 today” instead of working through a long transaction form.",
        },
        {
          title: "Automatic organization",
          body: "The AI parser structures the transaction and keeps category labels consistent for useful reporting.",
        },
        {
          title: "Your actual spending",
          body: "Charts and AI answers use the transactions saved in your account rather than invented financial data.",
        },
      ]}
    />
  );
}
