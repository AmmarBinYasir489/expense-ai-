// Single place that controls the app currency. Change CURRENCY to switch.
export const CURRENCY = "PKR";

export function formatMoney(amount: number | string): string {
  const n = Number(amount) || 0;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${CURRENCY}`;
}

export function formatSigned(amount: number, type: "income" | "expense"): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatMoney(Math.abs(amount))}`;
}
