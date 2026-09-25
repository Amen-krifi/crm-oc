import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Privileged Supabase client using the `service_role` secret key. This
 * bypasses Row Level Security entirely, so it must NEVER be imported into
 * client components and must NEVER have its result exposed directly to the
 * browser. Use it only from Server Actions / Route Handlers, and only after
 * you've verified the caller is an admin yourself — RLS isn't protecting
 * you here.
 *
 * Currently used for `auth.admin.createUser`, which is the only way to
 * create a login for someone else (regular sign-up requires the person to
 * do it themselves with their own session).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase → Project Settings → API → service_role key) to enable admin account creation.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
