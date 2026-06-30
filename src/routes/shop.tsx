import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productsQuery, PRODUCT_CATEGORIES, type Product } from "@/lib/shop-queries";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Vantage" },
      { name: "description", content: "Tickets, merchandise, rare collectibles, and fan memberships from the Vantage roster." },
      { property: "og:title", content: "Shop — Vantage" },
      { property: "og:description", content: "Tickets, merchandise, rare collectibles, and fan memberships from the Vantage roster." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(productsQuery),
  component: ShopPage,
});

const FILTERS = [{ value: "all", label: "All" }, ...PRODUCT_CATEGORIES];

function ShopPage() {
  const products = useQuery(productsQuery).data ?? [];
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<Product | null>(null);

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <header className="mb-12">
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-gold">The Store</p>
        <h1 className="font-display text-5xl uppercase italic leading-none md:text-7xl">Shop.</h1>
      </header>

      <div className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-y border-pearl/10 py-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-[11px] uppercase tracking-[0.3em] transition-colors ${
              filter === f.value ? "text-gold" : "text-pearl/50 hover:text-pearl"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-[11px] uppercase tracking-[0.3em] text-pearl/40">
          [ No items in this category ]
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => setActive(p)} className="group block text-left">
              <div className="relative aspect-square overflow-hidden bg-black">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-pearl/30">
                    No Image
                  </div>
                )}
                <span className="absolute left-3 top-3 bg-obsidian/80 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-pearl/70">
                  {p.category}
                </span>
                {p.stock <= 0 && (
                  <span className="absolute right-3 top-3 bg-destructive/90 px-2 py-1 text-[9px] uppercase tracking-[0.25em]">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-base uppercase tracking-tight">{p.title}</h2>
                <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-gold">
                  {Number(p.price).toFixed(2)} {p.currency}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && <ProductModal product={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden border border-pearl/15 bg-obsidian md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-square bg-black">
          {product.image_url && (
            <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-5 p-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{product.category}</p>
          <h3 className="font-display text-3xl uppercase">{product.title}</h3>
          <p className="text-[13px] uppercase tracking-[0.3em] text-pearl/80">
            {Number(product.price).toFixed(2)} {product.currency}
          </p>
          <p className="text-sm leading-relaxed text-pearl/70">
            {product.description || "No description available."}
          </p>
          <div className="mt-auto border-t border-pearl/10 pt-4 text-[10px] uppercase tracking-[0.3em] text-pearl/50">
            Stock: {product.stock > 0 ? `${product.stock} available` : "Sold out"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-pearl/60 hover:text-gold"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
