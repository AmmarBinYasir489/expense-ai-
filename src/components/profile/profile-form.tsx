"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CURRENCIES } from "@/lib/format";

type Props = {
  mode: "onboarding" | "settings";
  initialName?: string;
  initialCurrency?: string;
  initialTimezone?: string;
};

function timezoneOptions(): string[] {
  try {
    // Available in modern browsers; full IANA list.
    const list = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (list && list.length) return list;
  } catch {
    // ignore
  }
  return [
    "UTC",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
  ];
}

function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
  } catch {
    return "Asia/Karachi";
  }
}

export default function ProfileForm({
  mode,
  initialName = "",
  initialCurrency = "PKR",
  initialTimezone,
}: Props) {
  const router = useRouter();
  const zones = useMemo(() => timezoneOptions(), []);

  const [name, setName] = useState(initialName);
  const [currency, setCurrency] = useState(initialCurrency);
  const [timezone, setTimezone] = useState(
    initialTimezone || guessTimezone()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency, timezone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save. Try again.");
        return;
      }

      if (mode === "onboarding") {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-muted">
          What should I call you?
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Abdullah"
          maxLength={60}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/15"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-muted">
          Preferred currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-muted">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted">
          Used so &ldquo;today&rdquo; and &ldquo;yesterday&rdquo; match your
          local date.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent">
          Saved!
        </p>
      )}

      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {mode === "onboarding" ? "Get Started" : "Save Changes"}
      </button>
    </form>
  );
}
