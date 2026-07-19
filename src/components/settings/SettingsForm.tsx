import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defaultSettingsValues,
  languageLabels,
  languageOptions,
  settingsSchema,
  themeLabels,
  themeOptions,
  type SettingsFormValues,
} from "../../lib/validation/settingsSchema";
import { Checkbox, Field, SelectInput, TextArea, TextInput } from "../ui/FormField";

export function SettingsForm() {
  const [savedValues, setSavedValues] = useState<SettingsFormValues | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValues,
    mode: "onChange",
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(values: SettingsFormValues) {
    setSubmitMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSavedValues(values);
    setSubmitMessage("Settings saved successfully.");
    reset(values);
  }

  function handleReset() {
    reset(savedValues ?? defaultSettingsValues);
    setSubmitMessage(null);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-8"
      aria-labelledby="settings-heading"
    >
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          <p className="text-sm text-slate-500">
            Update how others see you on the site.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="displayName"
            label="Display name"
            error={errors.displayName?.message}
          >
            <TextInput
              id="displayName"
              autoComplete="name"
              placeholder="Jane Doe"
              error={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? "displayName-error" : undefined}
              {...register("displayName")}
            />
          </Field>

          <Field id="email" label="Email" error={errors.email?.message}>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              error={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </Field>
        </div>

        <Field
          id="bio"
          label="Bio"
          hint={`${bioValue.length}/500 characters`}
          error={errors.bio?.message}
        >
          <TextArea
            id="bio"
            placeholder="Tell visitors a little about yourself."
            error={Boolean(errors.bio)}
            aria-describedby={errors.bio ? "bio-error" : undefined}
            {...register("bio")}
          />
        </Field>

        <Field
          id="website"
          label="Website"
          hint="Optional. Include https://"
          error={errors.website?.message}
        >
          <TextInput
            id="website"
            type="url"
            placeholder="https://example.com"
            error={Boolean(errors.website)}
            aria-describedby={errors.website ? "website-error" : undefined}
            {...register("website")}
          />
        </Field>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Preferences</h2>
          <p className="text-sm text-slate-500">
            Customize appearance and language.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="theme" label="Theme" error={errors.theme?.message}>
            <SelectInput
              id="theme"
              error={Boolean(errors.theme)}
              aria-describedby={errors.theme ? "theme-error" : undefined}
              {...register("theme")}
            >
              {themeOptions.map((option) => (
                <option key={option} value={option}>
                  {themeLabels[option]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field id="language" label="Language" error={errors.language?.message}>
            <SelectInput
              id="language"
              error={Boolean(errors.language)}
              aria-describedby={errors.language ? "language-error" : undefined}
              {...register("language")}
            >
              {languageOptions.map((option) => (
                <option key={option} value={option}>
                  {languageLabels[option]}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500">
            Choose what updates you receive by email.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Checkbox
            id="emailNotifications"
            label="Email notifications"
            description="Receive alerts about account activity."
            {...register("emailNotifications")}
          />
          <Checkbox
            id="marketingEmails"
            label="Marketing emails"
            description="Get product news and feature announcements."
            {...register("marketingEmails")}
          />
        </div>
      </section>

      {submitMessage ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          {submitMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={!isDirty || !isValid || isSubmitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty || isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
        {!isValid && isDirty ? (
          <p className="text-xs text-slate-500">Fix validation errors before saving.</p>
        ) : null}
      </div>
    </form>
  );
}
