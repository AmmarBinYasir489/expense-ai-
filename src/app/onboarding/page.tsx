import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isProfileComplete } from "@/lib/profile";
import ProfileForm from "@/components/profile/profile-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (isProfileComplete(profile)) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl">
        <h1 className="text-2xl font-bold">👋 Welcome!</h1>
        <p className="mt-2 text-sm text-muted">
          A few quick details so I can personalize things for you.
        </p>
        <div className="mt-6">
          <ProfileForm
            mode="onboarding"
            initialName={profile?.name ?? ""}
            initialCurrency={profile?.currency || "PKR"}
            initialTimezone={profile?.timezone || undefined}
          />
        </div>
      </div>
    </main>
  );
}
