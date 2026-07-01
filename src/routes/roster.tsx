import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { artistsQuery } from "@/lib/queries";
import { resolveAsset } from "@/lib/assets";

const FILTERS = ["ALL", "MUSIC", "FILM & TV", "SPORTS", "LITERARY", "DIGITAL CREATORS"] as const;
type Filter = (typeof FILTERS)[number];

export const Route = createFileRoute("/roster")({
  head: () => ({
    meta: [
      { title: "Multi-Industry Roster — Vantage" },
      {
        name: "description",
        content:
          "Vantage represents talent across music, film & TV, sports, literary, and digital creators. Explore the full multi-industry roster.",
      },
      { property: "og:title", content: "Multi-Industry Roster — Vantage" },
      {
        property: "og:description",
        content: "Talent across music, film & TV, sports, literary, and digital creators.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/roster" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/roster" }],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(artistsQuery),
  component: RosterPage,
});

function normalize(industry: string) {
  return industry.trim().toUpperCase();
}

function RosterPage() {
  const artists = useQuery(artistsQuery).data ?? [];
  const [active, setActive] = useState<Filter>("ALL");

  const filtered = useMemo(() => {
    const activeOnly = artists.filter(
      (a) => (a.representation_status ?? "Active").toLowerCase() === "active",
    );
    if (active === "ALL") return activeOnly;
    return activeOnly.filter((a) => normalize(a.industry ?? "Music") === active);
  }, [artists, active]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-12 flex flex-col gap-8 border-b border-pearl/10 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">Multi-Industry</p>
          <h1 className="font-display text-5xl uppercase italic leading-none md:text-7xl">
            The Roster.
          </h1>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-pearl/40">
          [ {String(filtered.length).padStart(3, "0")} Active ]
        </span>
      </header>

      <nav className="mb-16 flex flex-wrap gap-x-8 gap-y-3 border-b border-pearl/10 pb-6">
        {FILTERS.map((f) => {
          const on = active === f;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`text-[11px] uppercase tracking-[0.35em] transition-colors ${
                on ? "text-gold" : "text-pearl/50 hover:text-pearl"
              }`}
            >
              {on && <span className="mr-2 text-gold">◆</span>}
              {f}
            </button>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-[11px] uppercase tracking-[0.3em] text-pearl/40">
          No talent listed under this category — yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => {
            const primary = resolveAsset(a.live_photo_url || a.cover_image);
            const secondary = resolveAsset(a.cover_image || a.live_photo_url);
            const showSwap = primary && secondary && primary !== secondary;
            return (
              <Link
                key={a.id}
                to="/artists/$slug"
                params={{ slug: a.slug }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-pearl/5">
                  <img
                    src={primary}
                    alt={a.name}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                      showSwap
                        ? "group-hover:opacity-0"
                        : "grayscale group-hover:grayscale-0 group-hover:scale-[1.03]"
                    }`}
                  />
                  {showSwap && (
                    <img
                      src={secondary}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    />
                  )}
                  <span className="absolute left-3 top-3 font-display text-[10px] uppercase tracking-widest text-pearl/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute right-3 top-3 border border-pearl/40 bg-obsidian/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.25em] text-pearl/80 backdrop-blur">
                    {a.industry || "Music"}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-xl uppercase tracking-tight">{a.name}</h2>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-pearl/50">
                      {a.discipline}
                    </p>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full border border-pearl/20 text-[10px] transition-colors group-hover:border-gold group-hover:text-gold">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
