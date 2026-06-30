import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { awardsQuery } from "@/lib/shop-queries";
import { artistsQuery } from "@/lib/queries";

export const Route = createFileRoute("/track-record")({
  head: () => ({
    meta: [
      { title: "Track Record — Vantage" },
      { name: "description", content: "Industry credentials archive: Grammy, BET, MTV VMA awards and chart-topping hits across the Vantage roster." },
      { property: "og:title", content: "Track Record — Vantage" },
      { property: "og:description", content: "Industry credentials archive: Grammy, BET, MTV VMA awards and chart-topping hits across the Vantage roster." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/track-record" },
    ],
    links: [{ rel: "canonical", href: "/track-record" }],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.prefetchQuery(awardsQuery),
    context.queryClient.prefetchQuery(artistsQuery),
  ]),
  component: TrackRecordPage,
});

function TrackRecordPage() {
  const awards = useQuery(awardsQuery).data ?? [];
  const artists = useQuery(artistsQuery).data ?? [];
  const artistMap = new Map(artists.map((a) => [a.id, a]));

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <header className="mb-16 flex items-end justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">The Ledger</p>
          <h1 className="font-display text-5xl uppercase italic leading-none md:text-7xl">Track Record.</h1>
        </div>
        <span className="hidden text-[10px] uppercase tracking-[0.25em] text-pearl/40 md:block">
          [ {String(awards.length).padStart(3, "0")} Entries ]
        </span>
      </header>

      <div className="border-t border-pearl/15">
        <div className="grid grid-cols-12 gap-4 border-b border-pearl/15 py-3 text-[10px] uppercase tracking-[0.3em] text-pearl/50">
          <div className="col-span-2">Year</div>
          <div className="col-span-3">Award Body</div>
          <div className="col-span-4">Category / Hit</div>
          <div className="col-span-3 text-right">Target Artist</div>
        </div>
        {awards.map((row) => {
          const artist = row.artist_id ? artistMap.get(row.artist_id) : null;
          return (
            <div
              key={row.id}
              className="grid grid-cols-12 items-baseline gap-4 border-b border-pearl/10 py-5 transition-colors hover:bg-pearl/[0.02]"
            >
              <div className="col-span-2 font-display text-2xl text-gold">{row.year}</div>
              <div className="col-span-3 text-[11px] uppercase tracking-[0.25em] text-pearl/80">{row.award_body}</div>
              <div className="col-span-4 font-serif italic text-pearl/90">{row.category}</div>
              <div className="col-span-3 text-right">
                {artist ? (
                  <Link
                    to="/artists/$slug"
                    params={{ slug: artist.slug }}
                    className="text-[11px] uppercase tracking-[0.25em] text-pearl underline-offset-4 hover:text-gold hover:underline"
                  >
                    {artist.name} →
                  </Link>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.25em] text-pearl/30">—</span>
                )}
              </div>
            </div>
          );
        })}
        {awards.length === 0 && (
          <p className="py-16 text-center text-[11px] uppercase tracking-[0.3em] text-pearl/40">
            [ No records logged yet ]
          </p>
        )}
      </div>
    </section>
  );
}
