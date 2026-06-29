import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Play } from "lucide-react";

import heroImg from "@/assets/hero.jpg";
import { artistsQuery, clientsQuery, testimonialsQuery } from "@/lib/queries";
import { resolveAsset } from "@/lib/assets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vantage — Talent Management" },
      {
        name: "description",
        content:
          "Vantage is a talent management agency representing musicians, performers, and digital creators defining the next cultural era.",
      },
      { property: "og:title", content: "Vantage — Talent Management" },
      {
        property: "og:description",
        content:
          "Representing the vanguard of digital creators and sonic architects globally.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(artistsQuery);
    context.queryClient.prefetchQuery(testimonialsQuery);
    context.queryClient.prefetchQuery(clientsQuery);
  },
  component: HomePage,
});

function HomePage() {
  const artists = useQuery(artistsQuery).data ?? [];
  const testimonials = useQuery(testimonialsQuery).data ?? [];
  const clients = useQuery(clientsQuery).data ?? [];

  const featured = artists.slice(0, 3);
  const marquee = clients.length ? [...clients, ...clients] : [];

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-16 flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden px-6 pb-20 md:px-12 md:pb-28">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Artist on stage in moody blue light"
            className="h-full w-full object-cover"
            width={1280}
            height={1920}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-gold">
            Talent Management — Est. 2012
          </p>
          <h1 className="font-display text-5xl uppercase leading-[0.95] md:text-7xl lg:text-8xl">
            Defining
            <br />
            <span className="italic text-gold">The Scene.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-pearl/70 md:text-base">
            Representing the vanguard of musicians, performers, and digital creators
            shaping what culture looks and sounds like next.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/contact"
              className="group inline-flex items-center justify-between gap-6 bg-gold px-6 py-4 font-display text-xs font-bold uppercase tracking-[0.25em] text-obsidian transition-transform hover:translate-x-1"
            >
              Secure Booking
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/artists"
              className="inline-flex items-center justify-center px-2 py-4 font-display text-xs uppercase tracking-[0.25em] text-pearl/80 hover:text-gold"
            >
              View the Roster →
            </Link>
          </div>
        </div>
      </section>

      {/* CLIENT MARQUEE */}
      <section className="overflow-hidden border-y border-pearl/10 py-10">
        <div className="flex w-max marquee gap-16 whitespace-nowrap">
          {marquee.map((c, i) => (
            <span
              key={`${c.id}-${i}`}
              className="font-display text-2xl uppercase tracking-tight text-pearl/20"
            >
              {c.name}
            </span>
          ))}
          {marquee.length === 0 && (
            <span className="font-display text-2xl uppercase text-pearl/20">
              Featured partners loading…
            </span>
          )}
        </div>
      </section>

      {/* FEATURED ROSTER */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">
              [ 01 / Roster ]
            </p>
            <h2 className="font-display text-4xl uppercase italic md:text-5xl">
              The House.
            </h2>
          </div>
          <Link
            to="/artists"
            className="hidden text-[10px] uppercase tracking-[0.25em] text-pearl/60 hover:text-gold md:block"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
          {featured.map((a) => (
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
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl uppercase tracking-tight">
                    {a.name}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-pearl/50">
                    {a.discipline}
                  </p>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full border border-pearl/20 text-[10px] transition-colors group-hover:border-gold group-hover:text-gold">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS GRID */}
      <section className="border-t border-pearl/10 bg-card px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-[10px] uppercase tracking-[0.35em] text-gold">
            [ 02 / Word on the street ]
          </p>
          <h2 className="mb-16 text-center font-display text-3xl uppercase italic md:text-4xl">
            What partners are saying.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <article
                key={t.id}
                className="group flex flex-col justify-between border border-pearl/10 bg-obsidian/40 p-6"
              >
                <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden bg-pearl/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-pearl/5 to-transparent" />
                  <div className="relative flex size-12 items-center justify-center rounded-full border border-gold/40 bg-obsidian/60 backdrop-blur transition-transform group-hover:scale-110">
                    <Play className="size-5 fill-gold text-gold" />
                  </div>
                </div>
                <p className="font-serif text-lg italic leading-snug text-pearl/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-pearl/10 pt-4">
                  <p className="font-display text-xs uppercase tracking-widest text-pearl">
                    {t.author}
                  </p>
                  {t.author_role && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-pearl/40">
                      {t.author_role}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-gold">
          [ 03 / Inquiries ]
        </p>
        <h2 className="font-display text-4xl uppercase leading-none md:text-6xl">
          Have something
          <br />
          <span className="italic text-gold">in mind?</span>
        </h2>
        <p className="mt-6 text-sm text-pearl/60">
          Brand campaigns, festival headliners, editorial, scoring, partnerships.
        </p>
        <Link
          to="/contact"
          className="mt-10 inline-flex items-center gap-6 bg-pearl px-8 py-4 font-display text-xs font-bold uppercase tracking-[0.25em] text-obsidian transition-transform hover:translate-x-1"
        >
          Start a brief
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
