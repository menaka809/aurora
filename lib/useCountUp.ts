"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useHydrated } from "./useHydrated";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Animates a number from 0 → target over `duration`ms using requestAnimationFrame
 * with an ease-out. Respects reduced motion (shows the target straight away).
 */
export function useCountUp(
  target: number,
  { duration = 1400, delay = 0 }: { duration?: number; delay?: number } = {}
): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  const hydrated = useHydrated();
  const prefersReduced = useReducedMotion();
  const reduce = hydrated && Boolean(prefersReduced);

  useEffect(() => {
    if (reduce) return;

    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      setValue(target * easeOutExpo(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    const delayTimer = window.setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(delayTimer);
      cancelAnimationFrame(frame.current);
    };
  }, [target, duration, delay, reduce]);

  return reduce ? target : value;
}
