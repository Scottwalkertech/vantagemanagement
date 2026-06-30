import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { charityWorksQuery, type CharityWork } from "@/lib/shop-queries";

export const Route = createFileRoute("/charity")({
  head: () => ({
    meta: [
      { title: "Charity Foundation — Vantage" },
      { name: "description", content: "Photojournalistic evidence of Vantage Foundation deployments and charitable initiatives." },
      { property: "og:title", content: "Charity Foundation — Vantage" },
      { property: "og:description", content: "Photojournalistic evidence of Vantage Foundation deployments and charitable initiatives." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/charity" },
    ],
    links: [{ rel: "canonical", href: "/charity" }],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(charityWorksQuery),
  component: CharityPage,
});

function CharityPage() {
  const works = useQuery(charityWorksQuery).data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-20 max-w-3xl">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">The Foundation</p>
        <h1 className="font-display text-5xl uppercase italic leading-none md:text-7xl">Charity.</h1>
        <p className="mt-6 max-w-xl font-serif text-lg italic text-pearl/70">
          Documented evidence of community deployments, philanthropic partnerships, and on-the-ground impact.
        </p>
      </header>

      <div className="space-y-32">
        {works.map((w, i) => (
          <Initiative key={w.id} work={w} align={i % 2 === 0 ? "left" : "right"} index={i} />
        ))}
        {works.length === 0 && (
          <p className="py-12 text-center text-[11px] uppercase tracking-[0.3em] text-pearl/40">
            [ No initiatives published yet ]
          </p>
        )}
      </div>
    </section>
  );
}

function Initiative({ work, align, index }: { work: CharityWork; align: "left" | "right"; index: number }) {
  const date = work.completed_on
    ? new Date(work.completed_on).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "Ongoing";

  return (
    <article className={`grid gap-10 md:grid-cols-12 ${align === "right" ? "md:[&>header]:col-start-7" : ""}`}>
      <header className={`md:col-span-5 ${align === "right" ? "md:order-2" : ""}`}>
        <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-gold">
          № {String(index + 1).padStart(2, "0")} · {date}
        </p>
        <p className="text-[11px] uppercase tracking-[0.3em] text-pearl/60">{work.organization}</p>
        <h2 className="mt-3 font-display text-3xl uppercase leading-tight md:text-4xl">{work.title}</h2>
        {work.summary && (
          <p className="mt-5 text-sm leading-relaxed text-pearl/70">{work.summary}</p>
        )}
      </header>
      <div className={`md:col-span-7 ${align === "right" ? "md:order-1" : ""}`}>
        <MasonryGrid images={work.evidence_images} alt={work.title} />
      </div>
    </article>
  );
}

function MasonryGrid({ images, alt }: { images: string[]; alt: string }) {
  if (!images?.length) {
    return (
      <div className="aspect-[4/3] bg-pearl/5" />
    );
  }
  return (
    <div className="columns-2 gap-3 md:gap-4 [&>img]:mb-3 md:[&>img]:mb-4">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} — evidence ${i + 1}`}
          loading="lazy"
          className="w-full break-inside-avoid bg-black object-cover grayscale transition-all duration-700 hover:grayscale-0"
        />
      ))}
    </div>
  );
}
