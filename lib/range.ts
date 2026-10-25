// The dashboard's reporting period, shared by Overview and Analytics.
// It lives in the URL (?range=90) so links are shareable, and in a cookie so
// it carries across pages.

import { parseAsNumberLiteral } from "nuqs/server";

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];
export const DEFAULT_RANGE: Range = 30;
export const RANGE_COOKIE = "aurora-range";

export const rangeParser = parseAsNumberLiteral(RANGES).withDefault(DEFAULT_RANGE);

export function isRange(v: unknown): v is Range {
  return RANGES.includes(Number(v) as Range);
}

/** URL first, then the remembered cookie, then the default. */
export function resolveRange(param: string | string[] | undefined, cookie: string | undefined): Range {
  const fromUrl = Array.isArray(param) ? param[0] : param;
  if (isRange(fromUrl)) return Number(fromUrl) as Range;
  if (isRange(cookie)) return Number(cookie) as Range;
  return DEFAULT_RANGE;
}
