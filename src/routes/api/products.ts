import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/products")({
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
        const artistId = url.searchParams.get("artistId");
        const includeUnpublished = url.searchParams.get("all") === "1";

        let query = sb.from("products").select("*").order("sort_order");
        if (!includeUnpublished) query = query.eq("is_published", true);
        if (artistId) query = query.eq("artist_id", artistId);

        const { data, error } = await query;
        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        return Response.json({ products: data ?? [] });
      },
    },
  },
});
