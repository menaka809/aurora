"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/Card";
import Segmented from "@/components/Segmented";
import { useUI, type Theme } from "@/lib/store";
import { toast } from "@/lib/toast";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.email("Enter a valid email"),
  company: z.string().min(2, "Enter your company"),
  role: z.enum(["Admin", "Editor", "Viewer"]),
  timezone: z.string().min(1, "Select a timezone"),
  bio: z
    .string()
    .max(160, "Keep it under 160 characters")
    .optional()
    .or(z.literal("")),
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

export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "Jordan Blake",
      email: "jordan@aurora.app",
      company: "Aurora Labs",
      role: "Admin",
      timezone: "UTC−05:00 · Eastern",
      bio: "Head of Growth. I live in the dashboard.",
    },
  });

  const bio = watch("bio") ?? "";

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 900));
    reset(data, { keepValues: true });
    toast("Changes saved", {
      description: "Your profile is up to date.",
      type: "success",
    });
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <Card>
        <CardHeader
          title="Profile"
          subtitle="This information appears across your workspace."
        />
        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName?.message}>
              <input {...register("fullName")} className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} />
            </Field>
            <Field label="Company" error={errors.company?.message}>
              <input {...register("company")} className={inputCls} />
            </Field>
            <Field label="Role" error={errors.role?.message}>
              <select {...register("role")} className={inputCls}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </Field>
            <Field label="Timezone" error={errors.timezone?.message}>
              <select {...register("timezone")} className={inputCls}>
                {TIMEZONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Bio"
              error={errors.bio?.message}
              hint={`${bio.length}/160`}
              className="sm:col-span-2"
            >
              <textarea
                {...register("bio")}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-border pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </Card>

      <AppearanceCard />
    </div>
  );
}

function AppearanceCard() {
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const hydrated = useUI((s) => s.hydrated);

  return (
    <Card>
      <CardHeader title="Appearance" subtitle="Choose how Aurora looks to you." />
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-fg">Theme</p>
          <p className="text-xs text-muted">Applies instantly across the app.</p>
        </div>
        <Segmented<Theme>
          idBase="settings-theme"
          value={hydrated ? theme : "dark"}
          onChange={setTheme}
          options={[
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ]}
        />
      </div>
    </Card>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg outline-none transition-colors focus:border-primary/60";

function Field({
  label,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted">{label}</label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
