import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { artistsQuery } from "@/lib/queries";
import { resolveAsset } from "@/lib/assets";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "The Roster — Vantage" },
      {
        name: "description",
        content:
          "Browse the Vantage roster — musicians, performers, and digital creators available for booking, brand partnerships, and editorial.",
      },
      { property: "og:title", content: "The Roster — Vantage" },
      {
        property: "og:description",
        content: "Vantage represents the vanguard of musicians, performers, and digital creators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/artists" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Roster — Vantage" },
      {
        name: "twitter:description",
        content: "Vantage represents the vanguard of musicians, performers, and digital creators.",
      },
    ],
    links: [{ rel: "canonical", href: "/artists" }],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(artistsQuery),
  component: RosterPage,
});

function RosterPage() {
  const artists = useQuery(artistsQuery).data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-16 flex items-end justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">
            The House
          </p>
          <h1 className="font-display text-5xl uppercase italic leading-none md:text-7xl">
            The Roster.
          </h1>
        </div>
        <span className="hidden text-[10px] uppercase tracking-[0.25em] text-pearl/40 md:block">
          [ {String(artists.length).padStart(3, "0")} Total ]
        </span>
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((a, i) => (
          <Link
            key={a.id}
            to="/artists/$slug"
            params={{ slug: a.slug }}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-pearl/5">
              <img
                src={resolveAsset(a.cover_image)}
                alt={a.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
              />
              <span className="absolute left-3 top-3 font-display text-[10px] uppercase tracking-widest text-pearl/70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl uppercase tracking-tight">{a.name}</h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-pearl/50">
                  {a.discipline}
                </p>
              </div>
              <span className="flex size-8 items-center justify-center rounded-full border border-pearl/20 text-[10px] transition-colors group-hover:border-gold group-hover:text-gold">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
