// Site-wide identity for metadata, sitemap and robots.

export const SITE_NAME = "Aurora";
export const SITE_TAGLINE = "Revenue analytics for SaaS teams";
export const SITE_DESCRIPTION =
  "Aurora is a SaaS revenue dashboard: MRR, churn and retention at a glance, live charts with period comparison, and a customer table with filters, saved views and bulk actions. A Next.js demo with sample data.";

/**
 * Absolute base URL for links in metadata (Open Graph images, sitemap).
 * Set NEXT_PUBLIC_SITE_URL for a custom domain; on Vercel the production URL
 * is picked up automatically.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return new URL(explicit ?? (vercel ? `https://${vercel}` : "http://localhost:3000"));
}
