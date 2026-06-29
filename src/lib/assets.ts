// Resolve DB-stored image paths (e.g. "/src-assets/artist-1.jpg") to bundled URLs.
import hero from "@/assets/hero.jpg";
import agent from "@/assets/agent.jpg";
import a1 from "@/assets/artist-1.jpg";
import a2 from "@/assets/artist-2.jpg";
import a3 from "@/assets/artist-3.jpg";
import a4 from "@/assets/artist-4.jpg";
import a5 from "@/assets/artist-5.jpg";
import a6 from "@/assets/artist-6.jpg";

const map: Record<string, string> = {
  "/src-assets/hero.jpg": hero,
  "/src-assets/agent.jpg": agent,
  "/src-assets/artist-1.jpg": a1,
  "/src-assets/artist-2.jpg": a2,
  "/src-assets/artist-3.jpg": a3,
  "/src-assets/artist-4.jpg": a4,
  "/src-assets/artist-5.jpg": a5,
  "/src-assets/artist-6.jpg": a6,
};

export function resolveAsset(path?: string | null): string {
  if (!path) return "";
  return map[path] ?? path;
}

export { hero as heroImage, agent as agentImage };
