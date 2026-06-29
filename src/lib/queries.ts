import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  discipline: string;
  short_bio: string | null;
  bio: string | null;
  achievements: string[];
  cover_image: string | null;
  gallery: string[];
  sort_order: number;
  is_published: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  author_role: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  sort_order: number;
};

export type Client = { id: string; name: string; sort_order: number };

export type AgentProfile = {
  id: string;
  name: string;
  title: string;
  headshot_url: string | null;
  story: string | null;
  philosophy: string | null;
  years_experience: string | null;
  focus: string | null;
};

export const artistsQuery = queryOptions({
  queryKey: ["artists"],
  queryFn: async (): Promise<Artist[]> => {
    const { data, error } = await supabase
      .from("artists")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Artist[];
  },
});

export const artistBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["artist", slug],
    queryFn: async (): Promise<Artist | null> => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Artist) ?? null;
    },
  });

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },
});

export const clientsQuery = queryOptions({
  queryKey: ["clients"],
  queryFn: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Client[];
  },
});

export const agentProfileQuery = queryOptions({
  queryKey: ["agent-profile"],
  queryFn: async (): Promise<AgentProfile | null> => {
    const { data, error } = await supabase
      .from("agent_profile")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as AgentProfile) ?? null;
  },
});
