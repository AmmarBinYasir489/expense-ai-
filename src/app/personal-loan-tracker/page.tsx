import type { Metadata } from "next";
import { HandCoins } from "lucide-react";
import SeoFeaturePage from "@/components/marketing/seo-feature-page";

export const metadata: Metadata = {
  title: "Personal Loan and Debt Tracker",
  description:
    "Track money you lent or borrowed, optional due dates, repayment status, and outstanding personal debts from one simple dashboard.",
  alternates: { canonical: "/personal-loan-tracker" },
};

export default function PersonalLoanTrackerPage() {
  return (
    <SeoFeaturePage
      eyebrow="Personal loan tracker"
      title="Remember who owes what without a separate spreadsheet"
      description="Keep personal lending and borrowing records beside your everyday finances. See what others owe you, what you owe them, and which entries are repaid."
      icon={HandCoins}
      benefits={[
        "Track money lent to another person or borrowed from them.",
        "Store an optional due date and a short description.",
        "Mark debts repaid and review the outstanding balance summary.",
      ]}
      sections={[
        {
          title: "Money lent",
          body: "Record amounts other people need to repay and keep the person’s name with the entry.",
        },
        {
          title: "Money borrowed",
          body: "Keep a clear list of personal amounts you owe without mixing them into completed expenses.",
        },
        {
          title: "Repayment status",
          body: "Mark a loan repaid when it is settled while retaining the record for your own reference.",
        },
      ]}
    />
  );
}
