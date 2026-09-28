import type { MetadataRoute } from "next";
import { professions, tools } from "@/content/microtools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://micronestmicrotools.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    ...professions.map((p) => ({ url: `${base}/profession/${p.slug}`, lastModified: now })),
    ...tools.map((t) => ({ url: `${base}/tools/${t.slug}`, lastModified: now })),
  ];
}
