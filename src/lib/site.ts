export const SITE_NAME = "Expense AI";
export const DEFAULT_SITE_URL = "https://wallet.pieinvent.online";

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return configured ? withProtocol(configured) : DEFAULT_SITE_URL;
}
