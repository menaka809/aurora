import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Data endpoints and the print-only report aren't pages to index.
      disallow: ["/api/", "/print/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
