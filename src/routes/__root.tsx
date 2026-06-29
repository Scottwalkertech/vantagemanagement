import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold uppercase italic text-gold">404</h1>
        <h2 className="mt-4 font-display text-xl uppercase tracking-tight text-pearl">Off the roster</h2>
        <p className="mt-2 text-sm text-pearl/60">
          That page isn&apos;t in our book. Try the index.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gold px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-obsidian"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl uppercase tracking-tight text-pearl">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-pearl/60">
          Something went wrong on our end. Try refreshing or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-gold px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-obsidian"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-pearl/20 px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-pearl"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vantage — Talent Management" },
      {
        name: "description",
        content:
          "Vantage is a talent management agency representing the vanguard of musicians, performers, and digital creators.",
      },
      { name: "author", content: "Vantage Management" },
      { property: "og:title", content: "Vantage — Talent Management" },
      {
        property: "og:description",
        content:
          "Talent management for the cultural vanguard — musicians, performers, and digital creators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vantage — Talent Management" },
      { name: "description", content: "Agent Spotlight Hub showcases talent, clients, and agent expertise with engaging multimedia and interactive features." },
      { property: "og:description", content: "Agent Spotlight Hub showcases talent, clients, and agent expertise with engaging multimedia and interactive features." },
      { name: "twitter:description", content: "Agent Spotlight Hub showcases talent, clients, and agent expertise with engaging multimedia and interactive features." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZJvwrWhJe0gnHY1HSmHnVQW3hny2/social-images/social-1782755082748-IMG_6075.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ZJvwrWhJe0gnHY1HSmHnVQW3hny2/social-images/social-1782755082748-IMG_6075.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-obsidian">
      <head>
        <HeadContent />
      </head>
      <body className="bg-obsidian text-pearl">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = pathname.startsWith("/auth") || pathname.startsWith("/_authenticated");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {!hideChrome && <Header />}
      <main className={hideChrome ? "" : "pt-16"}>
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
      <Toaster theme="dark" position="top-center" />
    </QueryClientProvider>
  );
}
