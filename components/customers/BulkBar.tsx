"use client";

import { useState } from "react";
import { ClipboardCopy, Download, Mail, Tag, UserRound, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const SUGGESTED_TAGS = ["VIP", "Expansion", "Needs onboarding", "Renewal Q1"];

const action =
  "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-fg transition-colors hover:bg-surface data-[state=open]:bg-surface";

/** Sticky action bar shown while rows are selected. */
export default function BulkBar({
  count,
  managers,
  exportHref,
  onCopy,
  onAssign,
  onTag,
  onMessage,
  onClear,
}: {
  count: number;
  managers: string[];
  exportHref: string;
  onCopy: () => void;
  onAssign: (manager: string) => void;
  onTag: (tag: string) => void;
  onMessage: () => void;
  onClear: () => void;
}) {
  const [tagOpen, setTagOpen] = useState(false);
  const [tag, setTag] = useState("");
  const addTag = (t: string) => {
    if (!t.trim()) return;
    onTag(t.trim());
    setTag("");
    setTagOpen(false);
  };

  return (
    <div
      role="toolbar"
      aria-label={`${count} selected`}
      className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-fit flex-wrap items-center gap-1 rounded-xl border border-border bg-elevated p-1.5 shadow-2xl md:bottom-6 print:hidden"
    >
      <span className="tabular px-2.5 text-sm font-medium text-fg">{count} selected</span>
      <span className="h-5 w-px bg-border" />

      <a href={exportHref} download className={action}>
        <Download className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Export</span>
      </a>
      <button onClick={onCopy} className={action}>
        <ClipboardCopy className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Copy</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className={action}>
          <UserRound className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">Assign</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="w-48">
          <DropdownMenuLabel>Account manager</DropdownMenuLabel>
          {managers.map((m) => (
            <DropdownMenuItem key={m} onSelect={() => onAssign(m)}>
              {m}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={tagOpen} onOpenChange={setTagOpen}>
        <PopoverTrigger asChild>
          <button className={action}>
            <Tag className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">Tag</span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-60 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTag(tag);
            }}
            className="space-y-2.5"
          >
            <label htmlFor="bulk-tag" className="block text-xs font-medium text-muted-foreground">
              Add a tag to {count} customers
            </label>
            <Input
              id="bulk-tag"
              autoFocus
              value={tag}
              maxLength={24}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag name"
            />
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-fg"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </PopoverContent>
      </Popover>

      <button onClick={onMessage} className={action}>
        <Mail className="size-4 text-muted-foreground" />
        <span className="hidden sm:inline">Message</span>
      </button>

      <span className="h-5 w-px bg-border" />
      <button
        onClick={onClear}
        aria-label="Clear selection"
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-fg"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
