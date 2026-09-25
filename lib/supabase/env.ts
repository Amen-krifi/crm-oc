/**
 * Normalizes Supabase environment variables, stripping any accidental
 * `/rest/v1/` path suffixes or trailing slashes.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}
