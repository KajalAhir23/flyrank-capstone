import { z } from "zod";

export const THEME_OPTIONS = ["light", "dark", "system"] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const;

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be at most 50 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .default(""),
  website: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "Please enter a valid URL",
    )
    .optional()
    .default(""),
  theme: z.enum(THEME_OPTIONS, {
    required_error: "Theme is required",
  }),
  language: z.string().min(1, "Language is required"),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const defaultSettingsValues: SettingsFormValues = {
  displayName: "",
  email: "",
  bio: "",
  website: "",
  theme: "system",
  language: "en",
  emailNotifications: true,
  marketingEmails: false,
};

export const sampleSavedSettings: SettingsFormValues = {
  displayName: "Jane Doe",
  email: "jane@example.com",
  bio: "Frontend developer building accessible forms.",
  website: "https://example.com",
  theme: "dark",
  language: "en",
  emailNotifications: true,
  marketingEmails: false,
};
