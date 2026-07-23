import type { Metadata } from "next";
import { Target } from "lucide-react";
import SeoFeaturePage from "@/components/marketing/seo-feature-page";

export const metadata: Metadata = {
  title: "Free Monthly Budget Tracker",
  description:
    "Set category limits with a free monthly budget tracker and monitor spending, remaining budget, and categories approaching their limits.",
  alternates: { canonical: "/budget-tracker" },
};

export default function BudgetTrackerPage() {
  return (
    <SeoFeaturePage
      eyebrow="Monthly budget tracker"
      title="Set practical budgets and follow your progress"
      description="Create a monthly spending limit for the categories that matter to you. Expense AI compares each budget with your recorded transactions and shows where you stand."
      icon={Target}
      benefits={[
        "Set a monthly limit for any spending category in your history.",
        "See the amount spent, the amount remaining, and percentage used.",
        "Receive clear warnings as a category approaches or exceeds its limit.",
      ]}
      sections={[
        {
          title: "Category budgets",
          body: "Give food, transport, shopping, or another category its own monthly spending limit.",
        },
        {
          title: "Live progress",
          body: "Every saved expense updates the relevant budget so progress stays connected to your transaction history.",
        },
        {
          title: "Useful warnings",
          body: "Budget insights identify limits that are nearly used or already exceeded without adding unnecessary complexity.",
        },
      ]}
    />
  );
}
