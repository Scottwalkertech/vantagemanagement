import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  getDbUrl,
  getDbAnonKey,
  getDbServiceRoleKey,
} from "@/lib/db-env.server";

const payloadSchema = z.object({
  artist_id: z.string().uuid(),
  product_ids: z.array(z.string().uuid()).max(500),
});

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/admin/bulk-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let sb: SupabaseClient<Database>;

        // Dev-only bypass: enabled only when DEV_BULK_LINK_SECRET is set on
        // the server AND the caller sends a matching x-dev-bypass header.
        // Uses service role because there's no user JWT in this path. Never
        // enable in production — leave the env var unset there.
        const devSecret = process.env.DEV_BULK_LINK_SECRET;
        const devHeader = request.headers.get("x-dev-bypass") ?? "";
        const devBypass =
          !!devSecret &&
          devHeader.length > 0 &&
          timingSafeEqualStr(devHeader, devSecret);

        if (devBypass) {
          sb = createClient<Database>(getDbUrl(), getDbServiceRoleKey(), {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
          });
        } else {
          const auth = request.headers.get("authorization") ?? "";
          if (!auth.toLowerCase().startsWith("bearer ")) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          const token = auth.slice(7);

          // Client scoped to the caller's JWT — RLS + has_role apply as the user.
          sb = createClient<Database>(getDbUrl(), getDbAnonKey(), {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
            global: { headers: { Authorization: `Bearer ${token}` } },
          });

          const { data: userData, error: userErr } = await sb.auth.getUser();
          if (userErr || !userData.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          const { data: isAdmin, error: roleErr } = await sb.rpc("has_role", {
            _user_id: userData.user.id,
            _role: "admin",
          });
          if (roleErr || !isAdmin) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }
        const { artist_id, product_ids } = parsed.data;

        // Detach any product currently linked to this artist that isn't in the new set.
        const detachQuery = sb
          .from("products")
          .update({ artist_id: null })
          .eq("artist_id", artist_id);
        const { error: detachErr } =
          product_ids.length > 0
            ? await detachQuery.not(
                "id",
                "in",
                `(${product_ids.map((id) => `"${id}"`).join(",")})`,
              )
            : await detachQuery;
        if (detachErr) {
          return Response.json({ error: detachErr.message }, { status: 500 });
        }

        // Attach the incoming product set to this artist.
        if (product_ids.length > 0) {
          const { error: attachErr } = await sb
            .from("products")
            .update({ artist_id })
            .in("id", product_ids);
          if (attachErr) {
            return Response.json({ error: attachErr.message }, { status: 500 });
          }
        }

        return Response.json({ ok: true, linked: product_ids.length });
      },
    },
  },
});
