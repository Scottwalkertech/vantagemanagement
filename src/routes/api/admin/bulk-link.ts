import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const payloadSchema = z.object({
  artist_id: z.string().uuid(),
  product_ids: z.array(z.string().uuid()).max(500),
});

export const Route = createFileRoute("/api/admin/bulk-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        if (!auth.toLowerCase().startsWith("bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = auth.slice(7);

        // Client scoped to the caller's JWT — RLS + has_role apply as the user.
        const sb = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
            global: { headers: { Authorization: `Bearer ${token}` } },
          },
        );

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
