import type { Modifier } from "@dnd-kit/core";

/** Keep dragged column headers on the header row (no vertical drift). */
export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});
