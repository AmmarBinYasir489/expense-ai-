// Default currency used until a profile currency is loaded.
export const DEFAULT_CURRENCY = "PKR";

// Back-compat alias for older imports.
export const CURRENCY = DEFAULT_CURRENCY;

export const CURRENCIES = [
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "BDT", label: "BDT — Bangladeshi Taka" },
];

export function isSupportedCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

export function formatMoney(
  amount: number | string,
  currency?: string | null
): string {
  const cur = currency || DEFAULT_CURRENCY;
  const n = Number(amount) || 0;
  return `${n.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ${cur}`;
}

export function formatSigned(
  amount: number,
  type: "income" | "expense",
  currency: string = DEFAULT_CURRENCY
): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatMoney(Math.abs(amount), currency)}`;
}
