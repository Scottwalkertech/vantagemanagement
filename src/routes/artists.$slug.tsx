import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Award, Download, FileText } from "lucide-react";
import { artistBySlugQuery, artistsQuery } from "@/lib/queries";
import { artistProductsQuery } from "@/lib/shop-queries";
import type { AwardRecord } from "@/lib/shop-queries";
import { resolveAsset } from "@/lib/assets";

const artistAwardsQuery = (artistId: string) =>
  queryOptions({
    queryKey: ["awards_records", "artist", artistId],
    queryFn: async (): Promise<AwardRecord[]> => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("awards_records")
        .select("*")
        .eq("artist_id", artistId)
        .order("year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AwardRecord[];
    },
  });



export const Route = createFileRoute("/artists/$slug")({
  head: ({ params, loaderData }) => {
    const artist = loaderData as
      | { name?: string; short_bio?: string | null; discipline?: string | null; cover_image?: string | null; gallery?: string[] | null; live_photo_url?: string | null }
      | undefined;
    const name = artist?.name ?? formatName(params.slug);
    const title = `${name} — Vantage`;
    const description =
      artist?.short_bio ??
      `${name}${artist?.discipline ? ` — ${artist.discipline}` : ""}. Represented by Vantage Management.`;
    const ogSource = artist?.live_photo_url ?? artist?.cover_image ?? artist?.gallery?.[0] ?? null;
    const image = ogSource ? resolveAsset(ogSource) : undefined;
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
    };
  },
  loader: async ({ context, params }) => {
    const artist = await context.queryClient.ensureQueryData(artistBySlugQuery(params.slug));
    if (!artist) throw notFound();
    context.queryClient.prefetchQuery(artistsQuery);
    context.queryClient.prefetchQuery(artistProductsQuery(artist.id));
    context.queryClient.prefetchQuery(artistAwardsQuery(artist.id));
    return artist;
  },
  notFoundComponent: () => <ArtistNotFound />,
  errorComponent: ({ error }) => (
    <div className="px-6 py-32 text-center">
      <p className="text-pearl/60">Couldn&apos;t load this artist. {error.message}</p>
    </div>
  ),
  component: ArtistDossier,
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

function ArtistDossier() {
  const { slug } = Route.useParams();
  const { data: artist } = useQuery(artistBySlugQuery(slug));
  const { data: all = [] } = useQuery(artistsQuery);

  if (!artist) throw notFound();

  const { data: products = [] } = useQuery(artistProductsQuery(artist.id));
  const { data: awards = [] } = useQuery(artistAwardsQuery(artist.id));

  const idx = all.findIndex((a) => a.slug === artist.slug);
  const next = all.length ? all[(idx + 1) % all.length] : null;
  const prev = all.length ? all[(idx - 1 + all.length) % all.length] : null;

  const heroImage = resolveAsset(artist.live_photo_url || artist.cover_image);

  return (
    <article className="bg-obsidian">
      {/* Breadcrumb bar */}
      <div className="border-b border-pearl/10 px-6 py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <Link
            to="/roster"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-pearl/50 hover:text-gold"
          >
            <ArrowLeft size={12} /> Roster
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-pearl/30">
            Dossier № {String(idx + 1).padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Split editorial */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* LEFT — sticky visual */}
        <div className="relative lg:sticky lg:top-0 lg:h-screen">
          <div className="relative h-[70vh] w-full overflow-hidden lg:h-full">
            <img
              src={heroImage}
              alt={artist.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/10" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
              <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-gold">
                {artist.industry || "Music"} — {artist.discipline}
              </p>
              <h1 className="font-display text-5xl uppercase italic leading-[0.85] text-pearl md:text-7xl xl:text-8xl">
                {artist.name}
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-gold" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-pearl/70">
                  {artist.representation_status || "Active"} Representation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — scroll */}
        <div className="px-6 py-16 md:px-12 md:py-24">
          <div className="max-w-xl">
            {/* 1. Biography */}
            <section>
              <SectionLabel n="01" title="Biography" />
              {artist.short_bio && (
                <p className="mt-6 font-serif text-xl leading-snug text-pearl/90 md:text-2xl">
                  {artist.short_bio}
                </p>
              )}
              <div className="mt-8 space-y-5 text-sm leading-relaxed text-pearl/70">
                {(artist.bio ?? "").split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            {/* 2. Awards & Accolades */}
            <section className="mt-20 border-t border-pearl/10 pt-12">
              <SectionLabel n="02" title="Awards & Accolades" />
              {awards.length === 0 && (!artist.achievements || artist.achievements.length === 0) ? (
                <p className="mt-6 text-sm text-pearl/40">No awards logged yet.</p>
              ) : (
                <ul className="mt-8 space-y-5">
                  {awards.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-4 border-b border-pearl/5 pb-5 last:border-0"
                    >
                      <Award className="mt-0.5 shrink-0 text-gold" size={18} />
                      <div className="flex-1">
                        <p className="font-display text-sm uppercase tracking-wider text-pearl">
                          {a.category}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-pearl/50">
                          {a.award_body} — {a.year}
                        </p>
                      </div>
                    </li>
                  ))}
                  {artist.achievements?.map((a, i) => (
                    <li key={`ach-${i}`} className="flex items-start gap-4 border-b border-pearl/5 pb-5 last:border-0">
                      <Award className="mt-0.5 shrink-0 text-gold" size={18} />
                      <p className="text-sm text-pearl/80">{a}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 3. Curated Collection */}
            <section className="mt-20 border-t border-pearl/10 pt-12">
              <SectionLabel n="03" title="Curated Collection" />
              {products.length === 0 ? (
                <p className="mt-6 text-sm text-pearl/40">
                  No products currently attached to this artist.
                </p>
              ) : (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      to="/shop"
                      className="group block"
                    >
                      <div className="aspect-square overflow-hidden bg-pearl/5">
                        {p.image_url ? (
                          <img
                            src={resolveAsset(p.image_url)}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-pearl/30">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="mt-3 font-display text-xs uppercase tracking-[0.2em] text-pearl group-hover:text-gold">
                        {p.title}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-pearl/50">
                        {Number(p.price).toFixed(2)} {p.currency}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Press Kit Links */}
            <section className="mt-20 border-t border-pearl/10 pt-12">
              <SectionLabel n="04" title="Press Kit Links" />
              <p className="mt-6 text-sm leading-relaxed text-pearl/70">
                Editorial assets, biographies, and approved imagery for press
                and partnership use.
              </p>
              <ul className="mt-8 space-y-2">
                {getPressKitLinks(artist).map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 border border-pearl/15 px-5 py-4 transition-colors hover:border-gold"
                    >
                      <span className="flex items-center gap-3">
                        <Download size={14} className="text-gold" />
                        <span className="font-display text-[11px] uppercase tracking-[0.3em] text-pearl group-hover:text-gold">
                          {link.label}
                        </span>
                      </span>
                      <ArrowRight size={14} className="text-pearl/40 group-hover:text-gold" />
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center gap-3 border border-pearl/20 px-6 py-4 font-display text-[10px] font-bold uppercase tracking-[0.35em] text-pearl transition-colors hover:border-gold hover:text-gold"
              >
                <FileText size={14} /> Press Enquiry
              </Link>
            </section>


            {/* Booking CTA */}
            <section className="mt-20 border-t border-pearl/10 pt-12">
              <Link
                to="/contact"
                className="group flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Book Talent</p>
                  <p className="mt-2 font-display text-2xl uppercase italic text-pearl group-hover:text-gold md:text-3xl">
                    Enquire about {artist.name.split(" ")[0]}
                  </p>
                </div>
                <ArrowRight className="text-pearl/40 group-hover:text-gold" />
              </Link>
            </section>
          </div>
        </div>
      </div>

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

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-display text-[10px] uppercase tracking-[0.4em] text-gold">[ {n} ]</span>
      <h2 className="font-display text-2xl uppercase italic text-pearl md:text-3xl">{title}</h2>
    </div>
  );
}

function getPressKitLinks(artist: { press_kit_url: string | null; slug: string; name: string }): { href: string; label: string }[] {
  const raw = (artist.press_kit_url ?? "").trim();
  if (!raw) {
    return [{ href: `/press/${artist.slug}.pdf`, label: `${artist.name} — Press Kit (PDF)` }];
  }
  const parts = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return parts.map((href, i) => ({
    href,
    label: parts.length > 1 ? `Press Asset ${String(i + 1).padStart(2, "0")}` : `${artist.name} — Press Kit`,
  }));
}

