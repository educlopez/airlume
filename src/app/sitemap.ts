import type { MetadataRoute } from "next";

export const baseUrl = "https://airlume.vercel.app/";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static routes
  const routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes];
}
