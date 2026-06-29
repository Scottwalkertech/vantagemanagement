import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { agentProfileQuery } from "@/lib/queries";
import { resolveAsset, agentImage } from "@/lib/assets";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Agent — Vantage" },
      {
        name: "description",
        content:
          "Meet the founder of Vantage — the story, the background, and the management philosophy behind the roster.",
      },
      { property: "og:title", content: "The Agent — Vantage" },
      {
        property: "og:description",
        content: "The story, background, and management philosophy behind Vantage.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: agentImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Agent — Vantage" },
      {
        name: "twitter:description",
        content: "The story, background, and management philosophy behind Vantage.",
      },
      { name: "twitter:image", content: agentImage },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(agentProfileQuery),
  component: AboutPage,
});

function AboutPage() {
  const profile = useQuery(agentProfileQuery).data;

  return (
    <article className="bg-pearl text-obsidian">
      {/* HERO */}
      <section className="border-b border-obsidian/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-obsidian/50">
            The Agent
          </p>
          <h1 className="font-display text-5xl uppercase leading-[0.95] md:text-7xl">
            {profile?.name ?? "—"}
            <br />
            <span className="italic">{profile?.title ?? ""}</span>
          </h1>
        </div>
      </section>

      {/* PORTRAIT + STORY */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <div className="aspect-[4/5] overflow-hidden bg-obsidian/5">
              <img
                src={resolveAsset(profile?.headshot_url) || agentImage}
                alt={profile?.name ?? "Agent portrait"}
                className="h-full w-full object-cover grayscale"
                width={800}
                height={1000}
                loading="lazy"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-obsidian/10 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-obsidian/50">
                  Experience
                </p>
                <p className="mt-1 text-sm">{profile?.years_experience ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-obsidian/50">
                  Focus
                </p>
                <p className="mt-1 text-sm">{profile?.focus ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-obsidian/50">
                [ 01 / The Story ]
              </p>
              <p className="font-serif text-2xl leading-snug md:text-3xl">
                {profile?.story}
              </p>
            </div>
            <div>
              <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-obsidian/50">
                [ 02 / Philosophy ]
              </p>
              <p className="font-display text-3xl uppercase italic leading-[1.05] md:text-4xl">
                &ldquo;{profile?.philosophy}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
