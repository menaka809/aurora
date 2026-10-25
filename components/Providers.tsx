"use client";

import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * App-wide client providers:
 * - MotionConfig: every framer-motion animation honours the OS
 *   "reduce motion" setting (the CSS rule only covers CSS animations).
 * - TooltipProvider: shared delay for all shadcn/Radix tooltips.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </MotionConfig>
  );
}
