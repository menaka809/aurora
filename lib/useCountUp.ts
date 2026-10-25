"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Shows `target` straight away (so the server HTML has the real number) and,
 * when it later changes — e.g. switching 7D → 90D — counts from the old value
 * to the new one with an ease-out. Reduced motion skips the animation.
 */
export function useCountUp(
  target: number,
  { duration = 900, delay = 0 }: { duration?: number; delay?: number } = {}
): number {
  const [value, setValue] = useState(target);
  const previous = useRef(target);
  const frame = useRef(0);
  const reduce = Boolean(useReducedMotion());

  useEffect(() => {
    const from = previous.current;
    previous.current = target;
    if (reduce || from === target) return;

    let startTime: number | null = null;
    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      setValue(from + (target - from) * easeOutExpo(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame.current);
    };
  }, [target, duration, delay, reduce]);

  return reduce ? target : value;
}
