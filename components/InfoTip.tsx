"use client";

import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

/**
 * "What does this metric mean?" hint. Opens on mouse hover, keyboard focus
 * and tap (Radix tooltips ignore touch, so this is a small popover), and
 * closes on Esc, tapping outside or moving the mouse away.
 */
export default function InfoTip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // A short delay lets the pointer move from the icon onto the popover.
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  // Hover only for mouse; touch uses the tap (click) path instead.
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") openNow();
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") closeSoon();
  };

  return (
    // Outside tap/click and Esc close it via onOpenChange.
    <Popover open={open} onOpenChange={setOpen}>
      {/* An anchor, not a trigger: a tap or click opens it rather than toggling,
          so tapping on touch (focus + click) can't open and instantly close it. */}
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={openNow}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocus={(e) => {
            if (e.currentTarget.matches(":focus-visible")) openNow();
          }}
          onBlur={closeSoon}
          className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:text-primary"
        >
          <Info className="size-3.5" />
        </button>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        className="w-64 gap-1 p-3 text-xs leading-relaxed"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        // Keep focus on the icon so hovering doesn't steal it.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="font-medium text-fg">{label}</p>
        <p className="text-muted-foreground">{text}</p>
      </PopoverContent>
    </Popover>
  );
}
