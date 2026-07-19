"use client";

import { useEffect, useRef, useState } from "react";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Animates a number from 0 → target over `duration`ms using requestAnimationFrame
 * with an ease-out. Respects reduced motion (jumps straight to the target).
 */
export function useCountUp(
  target: number,
  { duration = 1400, delay = 0, start = true }: {
    duration?: number;
    delay?: number;
    start?: boolean;
  } = {}
): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!start) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    let delayTimer: number | undefined;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      setValue(target * easeOutExpo(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else setValue(target);
    };

    delayTimer = window.setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(delayTimer);
      cancelAnimationFrame(frame.current);
    };
  }, [target, duration, delay, start]);

  return value;
}
