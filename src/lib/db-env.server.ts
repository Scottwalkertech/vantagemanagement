// Server-only helper: resolve database credentials.
//
// Priority: APP_DB_* when it looks like a real Supabase project URL
// (i.e. has a project-ref subdomain like `<ref>.supabase.co`). Otherwise
// fall back to SUPABASE_*. This avoids the footgun where APP_DB_URL is
// set to a bare `https://supabase.co`, which would silently route every
// server request at Supabase's marketing site and 500 the whole app.

function looksLikeProjectUrl(raw: string | undefined): raw is string {
  if (!raw) return false;
  try {
    const host = new URL(raw).host.toLowerCase();
    // require at least one label in front of supabase.co / supabase.in
    const parts = host.split(".");
    if (parts.length < 3) return false;
    const tail = parts.slice(-2).join(".");
    return tail === "supabase.co" || tail === "supabase.in";
  } catch {
    return false;
  }
}

const APP_DB_OK = looksLikeProjectUrl(process.env.APP_DB_URL);

if (process.env.APP_DB_URL && !APP_DB_OK) {
  console.warn(
    `[db-env] Ignoring APP_DB_URL (${process.env.APP_DB_URL}) — not a valid Supabase project URL. Falling back to SUPABASE_URL.`,
  );
}

export function getDbUrl(): string {
  const url = APP_DB_OK ? process.env.APP_DB_URL! : process.env.SUPABASE_URL;
  if (!url) throw new Error("Missing APP_DB_URL / SUPABASE_URL");
  return url;
}

export function getDbAnonKey(): string {
  const key = APP_DB_OK
    ? (process.env.APP_DB_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY)
    : (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.APP_DB_ANON_KEY);
  if (!key)
    throw new Error("Missing APP_DB_ANON_KEY / SUPABASE_PUBLISHABLE_KEY");
  return key;
}

export function getDbServiceRoleKey(): string {
  const key = APP_DB_OK
    ? (process.env.APP_DB_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY)
    : (process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.APP_DB_SERVICE_ROLE_KEY);
  if (!key)
    throw new Error(
      "Missing APP_DB_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY",
    );
  return key;
}
