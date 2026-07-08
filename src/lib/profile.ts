import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CURRENCY } from "./format";

export type Profile = {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  created_at: string;
};

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as Profile) ?? null;
}

// Safe values to fall back on before a profile is created.
export function profileDefaults(): Pick<Profile, "currency" | "timezone"> {
  return { currency: DEFAULT_CURRENCY, timezone: "UTC" };
}

// A profile row may be auto-created on signup (trigger) with a null name.
// Treat onboarding as done only once the user has actually set their name.
export function isProfileComplete(profile: Profile | null): boolean {
  return !!profile?.name?.trim();
}

// First word of the name, for friendly greetings ("Abdullah bin Yasir" -> "Abdullah").
export function firstName(name: string | null | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] || "there";
}
