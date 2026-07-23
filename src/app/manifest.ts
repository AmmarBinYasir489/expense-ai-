import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Expense AI — Smart Expense Tracker",
    short_name: "Expense AI",
    description:
      "Track expenses in plain language, follow monthly budgets, and manage personal loans.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f14",
    theme_color: "#4ade80",
    categories: ["finance", "productivity"],
  };
}
