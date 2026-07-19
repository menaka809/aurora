"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";
export type Toast = {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
};

let seq = 0;

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Fire a toast from anywhere (event handlers only). */
export function toast(
  title: string,
  opts?: { description?: string; type?: ToastType }
) {
  useToastStore.getState().push({
    title,
    description: opts?.description,
    type: opts?.type ?? "success",
  });
}
