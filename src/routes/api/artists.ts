import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/artists")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sb = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            auth: {
              storage: undefined,
              persistSession: false,
              autoRefreshToken: false,
            },
          },
        );
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        if (slug) {
          const { data, error } = await sb
            .from("artists")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (error) {
            return Response.json({ error: error.message }, { status: 500 });
          }
          return Response.json({ artist: data });
        }
        const { data, error } = await sb
          .from("artists")
          .select("*")
          .eq("is_published", true)
          .order("sort_order");
        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        return Response.json({ artists: data ?? [] });
      },
    },
  },
});
