import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: string;
  stock: number;
  is_published: boolean;
  artist_id: string | null;
  sort_order: number;
};

export type CharityWork = {
  id: string;
  organization: string;
  title: string;
  summary: string | null;
  completed_on: string | null;
  evidence_images: string[];
  sort_order: number;
};

export type AwardRecord = {
  id: string;
  year: number;
  award_body: string;
  category: string;
  artist_id: string | null;
  sort_order: number;
};

async function fetchProducts(params: {
  artistId?: string;
  all?: boolean;
}): Promise<Product[]> {
  const sp = new URLSearchParams();
  if (params.artistId) sp.set("artistId", params.artistId);
  if (params.all) sp.set("all", "1");
  const qs = sp.toString();
  const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Products request failed: ${res.status}`);
  }
  const body = (await res.json()) as { products: Product[] };
  return body.products ?? [];
}

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => fetchProducts({}),
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => fetchProducts({ all: true }),
});

export const artistProductsQuery = (artistId: string) =>
  queryOptions({
    queryKey: ["products", "artist", artistId],
    queryFn: () => fetchProducts({ artistId }),
  });

export const charityWorksQuery = queryOptions({
  queryKey: ["charity_works"],
  queryFn: async (): Promise<CharityWork[]> => {
    const { data, error } = await supabase
      .from("charity_works")
      .select("*")
      .order("completed_on", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CharityWork[];
  },
});

export const awardsQuery = queryOptions({
  queryKey: ["awards_records"],
  queryFn: async (): Promise<AwardRecord[]> => {
    const { data, error } = await supabase
      .from("awards_records")
      .select("*")
      .order("year", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AwardRecord[];
  },
});

export const PRODUCT_CATEGORIES = [
  { value: "tickets", label: "Tickets" },
  { value: "merchandise", label: "Merchandise" },
  { value: "collectibles", label: "Rare Collectibles" },
  { value: "membership", label: "Fan Memberships" },
] as const;
