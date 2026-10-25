"use client";

import { useEffect, useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// zod/mini: same validation, a fraction of the bundle size of classic zod.
import * as z from "zod/mini";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import SettingsSection from "./SettingsSection";
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

export default function ProfileSection() {
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

  const save = handleSubmit(async (data) => {
    await new Promise((r) => setTimeout(r, 600));
    setProfile(data);
    toast("Profile saved", { description: "Your changes are live across the workspace." });
  });

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
                <>
                  <Check className="size-3.5 text-success" />
                  <span className="text-muted-foreground">All changes saved</span>
                </>
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
        {/* Live preview of how you appear */}
        <div className="mb-6 flex items-center gap-4">
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
