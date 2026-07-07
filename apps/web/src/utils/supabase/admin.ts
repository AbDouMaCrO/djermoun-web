import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. SERVER-SIDE ONLY. Never import into a
// Client Component; the service key must never reach the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
