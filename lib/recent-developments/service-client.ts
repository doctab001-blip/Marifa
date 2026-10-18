import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Service-role client for the weekly scan and administrator review. Never import this into client components. */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Recent developments: Supabase service credentials are not configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } });
}
