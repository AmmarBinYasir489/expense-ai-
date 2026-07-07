import { createBrowserClient } from "@supabase/ssr";

// Cookie-based browser client so the session is readable by the
// server components and middleware (which use @supabase/ssr cookies).
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
