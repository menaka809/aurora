"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Modal from "./ui/Modal";
import type { CustomerProfile } from "@/lib/customers";
import { toast } from "@/lib/toast";

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition-colors focus:border-primary/60";

export default function MessageSheet({
  open,
  onOpenChange,
  customer: c,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerProfile;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError("Write a message before sending.");
      return;
    }
    onOpenChange(false);
    setSubject("");
    setBody("");
    setError(null);
    toast("Message sent", { description: `To ${c.name} <${c.email}>` });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={`Message ${c.name}`}
      description={`${c.company} · ${c.email}`}
    >
      <form onSubmit={send} className="flex flex-1 flex-col gap-4">
        <div>
          <label htmlFor="msg-subject" className="mb-1.5 block text-xs font-medium text-muted">
            Subject
          </label>
          <input
            id="msg-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={`Checking in on ${c.company}`}
            className={inputCls}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <label htmlFor="msg-body" className="mb-1.5 block text-xs font-medium text-muted">
            Message
          </label>
          <textarea
            id="msg-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            rows={8}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "msg-error" : undefined}
            className={`${inputCls} min-h-40 flex-1 resize-none`}
          />
          {error && (
            <p id="msg-error" className="mt-1.5 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted">Demo workspace — no email is sent.</p>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>
    </Modal>
  );
}
