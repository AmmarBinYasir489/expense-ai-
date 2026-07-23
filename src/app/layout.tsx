import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Expense AI Tracker — Budget, Spending & Loan Manager",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free AI expense tracker for recording spending in plain language, monitoring monthly budgets, managing personal loans, and understanding your money.",
  applicationName: SITE_NAME,
  keywords: [
    "AI expense tracker",
    "expense tracking app",
    "budget tracker",
    "personal finance tracker",
    "spending tracker",
    "AI budget assistant",
    "loan tracker",
    "expense manager",
    "free AI expense tracker",
    "natural language expense tracker",
    "monthly spending tracker",
    "personal loan tracker",
    "debt tracker",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: "Expense AI Tracker — Understand Your Spending Clearly",
    description:
      "Record expenses in plain language, track budgets and loans, and understand your spending from one private dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense AI Tracker — Budget and Spending Assistant",
    description:
      "Track spending in plain language, follow budgets, and manage personal loans.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "PeAEtV8xuT8PrHbnj-IUL2etISuYft0L7kS5uHZQq1I",
  },
  category: "finance",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
