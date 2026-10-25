"use client";

import type { ReactNode } from "react";
import RangeBar, { useRange } from "./RangeBar";
import type { Range } from "@/lib/range";

/**
 * The range bar plus the content it controls. The content stays
 * server-rendered (passed in as children); this island only adds the switch
 * and dims the content while the new period loads.
 */
export default function RangeShell({ range, children }: { range: Range; children: ReactNode }) {
  const { range: shown, pending, change } = useRange(range);
  return (
    <>
      <div className="rise">
        <RangeBar range={shown} pending={pending} onChange={change} />
      </div>
      <div
        aria-busy={pending}
        className={`space-y-4 transition-opacity md:space-y-5 ${pending ? "opacity-60" : ""}`}
      >
        {children}
      </div>
    </>
  );
}
