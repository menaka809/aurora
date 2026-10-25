// X/Twitter reads its own image tag; reuse the Open Graph card.
export { default, alt, size, contentType } from "./opengraph-image";
export const revalidate = 3600;
