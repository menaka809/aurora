import type { MetadataRoute } from "next";
import { NAV } from "@/lib/nav";
import { getCustomers } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const customers = await getCustomers();

  return [
    ...NAV.map((item) => ({
      url: new URL(item.href, base).toString(),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    { url: new URL("/login", base).toString(), lastModified: now, priority: 0.5 },
    ...customers.map((c) => ({
      url: new URL(`/customers/${c.id}`, base).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
