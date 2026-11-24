"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// zod/mini: same validation, a fraction of the bundle size of classic zod.
import * as z from "zod/mini";
import { Check, ChevronDown, Clock, Loader2, Mail } from "lucide-react";
import SettingsSection, { PreviewCard, SettingsPanel } from "./SettingsSection";
import { DEFAULT_PROFILE, useUI } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { useIsMac } from "@/lib/useIsMac";
import { avatarColor, initials } from "@/lib/customers";
import { toast } from "@/lib/toast";

const schema = z.object({
  fullName: z.string().check(z.minLength(2, { error: "Enter your full name" })),
  email: z.email({ error: "Enter a valid email" }),
  company: z.string().check(z.minLength(2, { error: "Enter your company" })),
  role: z.enum(["Admin", "Editor", "Viewer"]),
  timezone: z.string().check(z.minLength(1, { error: "Select a timezone" })),
  bio: z.string().check(z.maxLength(160, { error: "Keep it under 160 characters" })),
});

type FormValues = z.infer<typeof schema>;

const TIMEZONES = [
  "UTC−08:00 · Pacific",
  "UTC−05:00 · Eastern",
  "UTC+00:00 · London",
  "UTC+01:00 · Berlin",
  "UTC+05:30 · Mumbai",
  "UTC+09:00 · Tokyo",
];

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 aria-invalid:border-danger/70 aria-invalid:focus:ring-danger/15";

export default function ProfileSection({
  onDirtyChange,
}: {
  /** Lets the settings tabs flag unsaved edits while another tab is open. */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const profile = useUI((s) => s.profile);
  const setProfile = useUI((s) => s.setProfile);
  const hydrated = useHydrated();
  const isMac = useIsMac();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // Server HTML uses the defaults; the saved profile loads after hydration.
    defaultValues: DEFAULT_PROFILE,
  });

  useEffect(() => {
    if (hydrated) reset(profile);
  }, [hydrated, profile, reset]);

  // defaultValue puts the values in the server HTML, so fields are never blank
  // before JavaScript loads.
  const field = (name: keyof FormValues) => ({ ...register(name), defaultValue: DEFAULT_PROFILE[name] });

  const bio = useWatch({ control, name: "bio" }) ?? "";
  const fullName = useWatch({ control, name: "fullName" }) || "?";
  const role = useWatch({ control, name: "role" });
  const company = useWatch({ control, name: "company" });
  const email = useWatch({ control, name: "email" });
  const timezone = useWatch({ control, name: "timezone" });

  // "Saved" shows for 3s after each save, then the status line goes quiet.
  // A save counter restarts the timer when you save twice in a row.
  const [justSaved, setJustSaved] = useState(false);
  const [saves, setSaves] = useState(0);
  useEffect(() => {
    if (!saves) return;
    const id = window.setTimeout(() => setJustSaved(false), 3000);
    return () => window.clearTimeout(id);
  }, [saves]);

  const save = handleSubmit(async (data) => {
    await new Promise((r) => setTimeout(r, 600));
    setProfile(data);
    setJustSaved(true);
    setSaves((n) => n + 1);
    toast("Profile saved", { description: "Your changes are live across the workspace." });
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Ctrl/⌘ + S saves; leaving with unsaved edits asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty) void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [isDirty, save]);

  return (
    <SettingsPanel
      preview={
        <ProfilePreview
          fullName={fullName}
          role={role}
          company={company}
          email={email}
          timezone={timezone}
          bio={bio}
          dirty={isDirty}
        />
      }
    >
      <form onSubmit={save} noValidate>
        <SettingsSection
          id="profile"
          title="Profile"
          description="How you appear to teammates across the workspace."
          footer={
            <>
              <p aria-live="polite" className="flex items-center gap-2 text-xs">
                {isDirty ? (
                  <>
                    <span className="size-1.5 rounded-full bg-warning" />
                    <span className="text-fg">Unsaved changes</span>
                  </>
                ) : (
                  justSaved && (
                    <>
                      <Check className="size-3.5 text-success" />
                      <span className="text-muted-foreground">Saved</span>
                    </>
                  )
                )}
              </p>
              <div className="flex items-center gap-2">
                {isDirty && (
                  <button
                    type="button"
                    onClick={() => reset(profile)}
                    className="h-9 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-fg/5 hover:text-fg"
                  >
                    Discard
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="flex h-9 items-center gap-2 rounded-lg bg-primary-solid px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Save changes
                  <kbd className="hidden rounded border border-white/30 px-1 text-[10px] font-normal text-white/80 sm:inline">
                    {isMac ? "⌘S" : "Ctrl S"}
                  </kbd>
                </button>
              </div>
            </>
          }
        >
          {/* Live preview of how you appear (beside the form on wide screens) */}
          <div className="mb-6 flex items-center gap-4 2xl:hidden">
            <span
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white transition-colors"
              style={{ background: avatarColor(fullName) }}
            >
              {initials(fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{fullName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {role} · {company || "No company"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Your avatar uses your initials.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName?.message}>
              {(c) => <input {...c} {...field("fullName")} autoComplete="name" className={inputCls} />}
            </Field>
            <Field label="Email" error={errors.email?.message} help="Used for sign-in and notifications.">
              {(c) => (
                <input {...c} {...field("email")} type="email" autoComplete="email" className={inputCls} />
              )}
            </Field>
            <Field label="Company" error={errors.company?.message}>
              {(c) => (
                <input {...c} {...field("company")} autoComplete="organization" className={inputCls} />
              )}
            </Field>
            <Field label="Role" error={errors.role?.message} help="Admins can manage billing and members.">
              {(c) => (
                <Select>
                  <select {...c} {...field("role")} className={`${inputCls} appearance-none pr-9`}>
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                </Select>
              )}
            </Field>
            <Field label="Timezone" error={errors.timezone?.message} help="Reports and dates use this timezone.">
              {(c) => (
                <Select>
                  <select {...c} {...field("timezone")} className={`${inputCls} appearance-none pr-9`}>
                    {TIMEZONES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Select>
              )}
            </Field>
            <Field
              label="Bio"
              error={errors.bio?.message}
              hint={`${bio.length}/160`}
              help="Shown on your profile card."
              className="sm:col-span-2"
            >
              {(c) => (
                <textarea
                  {...c}
                  {...field("bio")}
                  rows={3}
                  className={`${inputCls} h-auto resize-none py-2.5`}
                />
              )}
            </Field>
          </div>
        </SettingsSection>
      </form>
    </SettingsPanel>
  );
}

// A clock that ticks once a minute, for the local time in the preview.
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);

/** "UTC−05:00 · Eastern" → the current time there, e.g. "9:41 AM". */
function localTime(timezone: string, minute: number): string | null {
  const m = /UTC([+−-])(\d{2}):(\d{2})/.exec(timezone);
  if (!m) return null;
  const sign = m[1] === "+" ? 1 : -1;
  const offset = sign * (Number(m[2]) * 60 + Number(m[3]));
  const at = new Date((minute + offset) * 60_000);
  return at.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

/** The profile card teammates see, updating live as the form changes. */
function ProfilePreview({
  fullName,
  role,
  company,
  email,
  timezone,
  bio,
  dirty,
}: {
  fullName: string;
  role: string;
  company: string;
  email: string;
  timezone: string;
  bio: string;
  dirty: boolean;
}) {
  // 0 on the server: the time only appears once the browser's clock is known.
  const minute = useSyncExternalStore(subscribeMinute, minuteNow, () => 0);
  const time = minute ? localTime(timezone, minute) : null;
  const place = timezone.split("·")[1]?.trim();

  return (
    <PreviewCard
      title="Your profile card"
      tip={
        dirty
          ? "You have unsaved changes. Save them so your team sees this card."
          : "This is how teammates see you. It changes as you type."
      }
    >
      <div className="card-shadow overflow-hidden rounded-xl border border-border bg-surface">
        <div aria-hidden className="h-16 bg-gradient-to-br from-primary/30 via-primary/10 to-chart-4/25" />
        <div className="px-5 pb-5">
          <span
            aria-hidden
            className="-mt-8 flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white ring-4 ring-surface"
            style={{ background: avatarColor(fullName) }}
          >
            {initials(fullName)}
          </span>
          <div className="mt-3 flex min-w-0 items-center gap-2">
            <p className="truncate font-semibold text-fg">{fullName}</p>
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
              {role}
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">{company || "No company"}</p>
          <p className={`mt-3 text-sm leading-relaxed ${bio ? "text-fg" : "italic text-muted-foreground"}`}>
            {bio || "No bio yet."}
          </p>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0" />
              <span>
                {time && <span className="text-fg">{time} </span>}
                local time{place ? ` · ${place}` : ""}
              </span>
            </p>
          </div>
        </div>
      </div>
    </PreviewCard>
  );
}

/** Native select with a chevron that matches the rest of the UI. */
function Select({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** Props a Field hands to its input so label, help and error are all linked. */
type FieldControl = { id: string; "aria-invalid": boolean; "aria-describedby"?: string };

function Field({
  label,
  error,
  hint,
  help,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  /** Short note beside the label, e.g. a character count. */
  hint?: string;
  /** Helper text under the input (hidden while there's an error). */
  help?: string;
  className?: string;
  children: (control: FieldControl) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const helpId = `${id}-help`;
  const describedBy =
    [error ? errorId : help && helpId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint && (
          <span id={hintId} className="tabular text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        help && (
          <p id={helpId} className="mt-1.5 text-xs text-muted-foreground">
            {help}
          </p>
        )
      )}
    </div>
  );
}
