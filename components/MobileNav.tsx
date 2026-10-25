"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV, isNavActive } from "@/lib/nav";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-surface/90 backdrop-blur-md md:hidden print:hidden">
      {NAV.map((item) => {
        const active = isNavActive(item, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mobile-active"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
              />
            )}
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
