"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X, type LucideIcon } from "lucide-react";
import { useToastStore, type ToastType } from "@/lib/toast";

const ICON: Record<ToastType, { icon: LucideIcon; cls: string }> = {
  success: { icon: CheckCircle2, cls: "text-success" },
  error: { icon: XCircle, cls: "text-danger" },
  info: { icon: Info, cls: "text-primary" },
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2.5 print:hidden">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, cls } = ICON[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-elevated p-3.5 shadow-2xl"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-muted-foreground transition-colors hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
