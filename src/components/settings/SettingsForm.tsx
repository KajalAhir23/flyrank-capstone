import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField, { getFieldAriaProps } from "../ui/FormField";
import {
  defaultSettingsValues,
  LANGUAGE_OPTIONS,
  settingsSchema,
  THEME_OPTIONS,
  type SettingsFormValues,
} from "../../lib/validation/settingsSchema";

type SettingsFormProps = {
  initialValues?: SettingsFormValues;
  onSave?: (values: SettingsFormValues) => void | Promise<void>;
};

const inputClassName =
  "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export default function SettingsForm({
  initialValues = defaultSettingsValues,
  onSave,
}: SettingsFormProps) {
  const [savedValues, setSavedValues] = useState<SettingsFormValues>(initialValues);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: savedValues,
    mode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    await onSave?.(values);
    setSavedValues(values);
    reset(values);
  });

  const handleReset = useCallback(() => {
    reset(savedValues);
  }, [reset, savedValues]);

  const bioValue = watch("bio") ?? "";
  const canSave = isValid && isDirty && !isSubmitting;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto max-w-xl space-y-6 rounded-lg bg-white p-6 shadow-sm"
    >
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your profile and preferences.
        </p>
      </header>

      <FormField
        id="displayName"
        label="Display name"
        error={errors.displayName?.message}
      >
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          className={inputClassName}
          {...register("displayName")}
          {...getFieldAriaProps("displayName", errors.displayName?.message)}
        />
      </FormField>

      <FormField id="email" label="Email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClassName}
          {...register("email")}
          {...getFieldAriaProps("email", errors.email?.message)}
        />
      </FormField>

      <FormField id="bio" label="Bio" error={errors.bio?.message}>
        <textarea
          id="bio"
          rows={4}
          className={inputClassName}
          {...register("bio")}
          {...getFieldAriaProps("bio", errors.bio?.message)}
        />
        <p className="text-xs text-gray-500">{bioValue.length}/500</p>
      </FormField>

      <FormField id="website" label="Website" error={errors.website?.message}>
        <input
          id="website"
          type="url"
          autoComplete="url"
          placeholder="https://example.com"
          className={inputClassName}
          {...register("website")}
          {...getFieldAriaProps("website", errors.website?.message)}
        />
      </FormField>

      <FormField id="theme" label="Theme" error={errors.theme?.message}>
        <select
          id="theme"
          className={inputClassName}
          {...register("theme")}
          {...getFieldAriaProps("theme", errors.theme?.message)}
        >
          {THEME_OPTIONS.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="language" label="Language" error={errors.language?.message}>
        <select
          id="language"
          className={inputClassName}
          {...register("language")}
          {...getFieldAriaProps("language", errors.language?.message)}
        >
          {LANGUAGE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <fieldset className="space-y-4 rounded-md border border-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-gray-700">
          Email preferences
        </legend>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register("emailNotifications")}
          />
          <span className="text-sm text-gray-700">Email notifications</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register("marketingEmails")}
          />
          <span className="text-sm text-gray-700">Marketing emails</span>
        </label>
      </fieldset>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty || isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
