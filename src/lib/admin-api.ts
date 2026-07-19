import { supabase } from "@/integrations/supabase/client";

export type AdminTable =
  | "artists"
  | "testimonials"
  | "clients"
  | "agent_profile"
  | "products"
  | "charity_works"
  | "awards_records"
  | "inquiries";

type MutateArgs =
  | { table: AdminTable; op: "insert"; values: Record<string, unknown> }
  | { table: AdminTable; op: "update"; id: string; values: Record<string, unknown> }
  | { table: AdminTable; op: "delete"; id: string };

export async function adminMutate<T = unknown>(args: MutateArgs): Promise<T | null> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Session expired — sign in again.");

  const res = await fetch("/api/admin/mutate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(args),
  });
  const body = await res.json().catch(() => ({}) as { error?: string; row?: T });
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return (body?.row ?? null) as T | null;
}
