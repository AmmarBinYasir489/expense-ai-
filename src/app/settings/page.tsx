import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isProfileComplete } from "@/lib/profile";
import ProfileForm from "@/components/profile/profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!isProfileComplete(profile)) redirect("/onboarding");

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <h1 className="mt-6 text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-muted">{user.email}</p>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
        <ProfileForm
          mode="settings"
          initialName={profile!.name}
          initialCurrency={profile!.currency || "PKR"}
          initialTimezone={profile!.timezone || undefined}
        />
      </div>
    </main>
  );
}
