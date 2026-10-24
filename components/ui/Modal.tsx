"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

/** Accessible dialog (focus trap, Esc, labelled) — centred, or as a right-hand sheet. */
export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  side = "center",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "center" | "right";
  children: ReactNode;
}) {
  const panel =
    side === "right"
      ? "modal-sheet fixed inset-y-0 right-0 flex w-full max-w-md flex-col border-l"
      : "modal-pop fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-fade fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={`${panel} z-[71] border-border bg-elevated p-6 shadow-2xl outline-none`}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold tracking-tight text-fg">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="rounded-md p-1 text-muted transition-colors hover:text-fg"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
