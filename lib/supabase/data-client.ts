import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isTemporaryOpenAdminMode } from "@/lib/access-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createSupabaseDataClient() {
  if (!isTemporaryOpenAdminMode()) return createSupabaseServerClient();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Temporary admin data access is not configured.");

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
