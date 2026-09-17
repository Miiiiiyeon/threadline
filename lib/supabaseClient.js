import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, so this file must never be
// imported into a "use client" component — only server components / route handlers.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}
