// Server-only helper: resolve database credentials with APP_DB_* as primary
// and SUPABASE_* as fallback. Keeps the auto-generated browser clients untouched.

export function getDbUrl(): string {
  const url = process.env.APP_DB_URL ?? process.env.SUPABASE_URL;
  if (!url) throw new Error("Missing APP_DB_URL / SUPABASE_URL");
  return url;
}

export function getDbAnonKey(): string {
  const key =
    process.env.APP_DB_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("Missing APP_DB_ANON_KEY / SUPABASE_PUBLISHABLE_KEY");
  return key;
}

export function getDbServiceRoleKey(): string {
  const key =
    process.env.APP_DB_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key)
    throw new Error(
      "Missing APP_DB_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY",
    );
  return key;
}
