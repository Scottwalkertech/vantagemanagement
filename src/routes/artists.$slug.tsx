import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { artistBySlugQuery, artistsQuery } from "@/lib/queries";
import { resolveAsset } from "@/lib/assets";

export const Route = createFileRoute("/artists/$slug")({
  head: ({ params, loaderData }) => {
    const artist = loaderData as { name?: string; short_bio?: string | null; discipline?: string | null; cover_image?: string | null } | undefined;
    const name = artist?.name ?? formatName(params.slug);
    const title = `${name} — Vantage`;
    const description =
      artist?.short_bio ??
      `${name}${artist?.discipline ? ` — ${artist.discipline}` : ""}. Represented by Vantage Management.`;
    const image = artist?.cover_image ? resolveAsset(artist.cover_image) : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `/artists/${params.slug}` },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: `/artists/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name,
            jobTitle: artist?.discipline ?? undefined,
            description,
            image: image ?? undefined,
          }),
        },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const artist = await context.queryClient.ensureQueryData(artistBySlugQuery(params.slug));
    context.queryClient.prefetchQuery(artistsQuery);
    return artist;
  },
  notFoundComponent: () => <ArtistNotFound />,
  errorComponent: ({ error }) => (
    <div className="px-6 py-32 text-center">
      <p className="text-pearl/60">Couldn&apos;t load this artist. {error.message}</p>
    </div>
  ),
  component: ArtistPage,
});

function formatName(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function ArtistNotFound() {
  return (
    <div className="px-6 py-32 text-center">
      <h1 className="font-display text-3xl uppercase">Artist not found</h1>
      <Link to="/artists" className="mt-6 inline-block text-sm text-gold underline">
        Back to roster
      </Link>
    </div>
  );
}

function ArtistPage() {
  const { slug } = Route.useParams();
  const { data: artist } = useQuery(artistBySlugQuery(slug));
  const { data: all = [] } = useQuery(artistsQuery);

  if (!artist) {
    throw notFound();
  }

  const idx = all.findIndex((a) => a.slug === artist.slug);
  const next = all[(idx + 1) % all.length];
  const prev = all[(idx - 1 + all.length) % all.length];

  const gallery = artist.gallery?.length ? artist.gallery : artist.cover_image ? [artist.cover_image] : [];

  return (
    <article>
      {/* HEADER */}
      <section className="border-b border-pearl/10 px-6 pb-12 pt-12 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-pearl/50 hover:text-gold"
          >
            <ArrowLeft size={12} /> Roster
          </Link>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">
                {artist.discipline}
              </p>
              <h1 className="font-display text-5xl uppercase italic leading-[0.9] md:text-8xl">
                {artist.name}
              </h1>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-4 self-start bg-gold px-5 py-3 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-obsidian md:self-end"
            >
              Book {artist.name.split(" ")[0]} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="aspect-[4/5] overflow-hidden bg-pearl/5">
              <img
                src={resolveAsset(artist.cover_image)}
                alt={artist.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">
              [ Biography ]
            </p>
            <p className="font-serif text-xl leading-snug text-pearl/90 md:text-2xl">
              {artist.short_bio}
            </p>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-pearl/70">
              {(artist.bio ?? "").split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {artist.achievements?.length > 0 && (
              <div className="mt-12 border-t border-pearl/10 pt-8">
                <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-gold">
                  [ Notable Achievements ]
                </p>
                <ul className="space-y-3">
                  {artist.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-pearl/80">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-gold" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 1 && (
        <section className="border-t border-pearl/10 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-8 text-[10px] uppercase tracking-[0.35em] text-gold">
              [ Gallery ]
            </p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {gallery.map((g, i) => (
                <div key={i} className="aspect-[4/5] overflow-hidden bg-pearl/5">
                  <img
                    src={resolveAsset(g)}
                    alt={`${artist.name} — ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PREV / NEXT */}
      {all.length > 1 && prev && next && (
        <section className="grid border-t border-pearl/10 md:grid-cols-2">
          <Link
            to="/artists/$slug"
            params={{ slug: prev.slug }}
            className="group flex items-center justify-between border-pearl/10 px-6 py-10 md:border-r"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/40">Previous</p>
              <p className="mt-2 font-display text-2xl uppercase italic group-hover:text-gold">
                {prev.name}
              </p>
            </div>
            <ArrowLeft className="text-pearl/40 group-hover:text-gold" />
          </Link>
          <Link
            to="/artists/$slug"
            params={{ slug: next.slug }}
            className="group flex items-center justify-between px-6 py-10"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/40">Next</p>
              <p className="mt-2 font-display text-2xl uppercase italic group-hover:text-gold">
                {next.name}
              </p>
            </div>
            <ArrowRight className="text-pearl/40 group-hover:text-gold" />
          </Link>
        </section>
      )}
    </article>
  );
}
