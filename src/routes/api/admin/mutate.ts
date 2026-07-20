import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  getDbUrl,
  getDbAnonKey,
  getDbServiceRoleKey,
} from "@/lib/db-env.server";

const ALLOWED_TABLES = [
  "artists",
  "testimonials",
  "clients",
  "agent_profile",
  "products",
  "charity_works",
  "awards_records",
  "inquiries",
] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

const payloadSchema = z.object({
  table: z.enum(ALLOWED_TABLES),
  op: z.enum(["insert", "update", "delete"]),
  id: z.string().uuid().optional(),
  values: z.record(z.string(), z.unknown()).optional(),
});

export const Route = createFileRoute("/api/admin/mutate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawAuth = request.headers.get("authorization");
        if (!rawAuth) {
          console.error("[admin/mutate] Missing Authorization header");
          return Response.json({ error: "Unauthorized: missing Authorization header" }, { status: 401 });
        }
        if (!rawAuth.toLowerCase().startsWith("bearer ")) {
          console.error("[admin/mutate] Authorization header is not a Bearer token", {
            prefix: rawAuth.slice(0, 12),
          });
          return Response.json({ error: "Unauthorized: expected Bearer token" }, { status: 401 });
        }
        const token = rawAuth.slice(7).trim();
        if (!token) {
          console.error("[admin/mutate] Bearer token was empty after extraction");
          return Response.json({ error: "Unauthorized: empty bearer token" }, { status: 401 });
        }

        // Caller-scoped client to verify identity + admin role via RLS-safe RPC.
        const asUser = createClient<Database>(getDbUrl(), getDbAnonKey(), {
          auth: {
            storage: undefined,
            persistSession: false,
            autoRefreshToken: false,
          },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data: userData, error: userErr } = await asUser.auth.getUser();
        if (userErr || !userData.user) {
          console.error("[admin/mutate] Failed to resolve user from token", {
            message: userErr?.message,
            status: userErr?.status,
          });
          return Response.json({ error: "Unauthorized: token did not resolve to a user" }, { status: 401 });
        }
        const { data: isAdmin, error: roleErr } = await asUser.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        if (roleErr || !isAdmin) {
          console.error("[admin/mutate] has_role check failed or user is not admin", {
            userId: userData.user.id,
            roleErr: roleErr?.message,
            isAdmin,
          });
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
          return Response.json(
            { error: "Invalid payload", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const { table, op, id, values } = parsed.data;

        // Verified admin — use service role for the write (RLS bypassed intentionally).
        const admin = createClient<Database>(getDbUrl(), getDbServiceRoleKey(), {
          auth: {
            storage: undefined,
            persistSession: false,
            autoRefreshToken: false,
          },
        });

        const t = admin.from(table as AllowedTable);

        if (op === "insert") {
          if (!values) {
            return Response.json({ error: "values required" }, { status: 400 });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (t as any).insert(values).select().maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ ok: true, row: data });
        }
        if (op === "update") {
          if (!id || !values) {
            return Response.json({ error: "id and values required" }, { status: 400 });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (t as any).update(values).eq("id", id).select().maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ ok: true, row: data });
        }
        // delete
        if (!id) {
          return Response.json({ error: "id required" }, { status: 400 });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (t as any).delete().eq("id", id);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
