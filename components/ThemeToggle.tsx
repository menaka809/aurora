"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useUI } from "@/lib/store";
import { useResolvedTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const toggle = useUI((s) => s.toggleTheme);
  const isLight = useResolvedTheme() === "light";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-fg"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? "sun" : "moon"}
          initial={{ y: 8, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -8, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25 }}
        >
          {isLight ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
