import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Expense AI — Smart Expense Tracker & Budget Assistant",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Track expenses in plain language, organize spending automatically, set monthly budgets, manage personal loans, and get useful AI-powered money insights.",
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
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: "Expense AI — Track spending by simply describing it",
    description:
      "Turn everyday money notes into organized transactions, budgets, charts, and useful financial insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense AI — Smart expense tracking made simple",
    description:
      "Track spending in plain language and understand where your money goes.",
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
