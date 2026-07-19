import { z } from "zod";

export const themeOptions = ["light", "dark", "system"] as const;
export const languageOptions = ["en", "es", "fr", "de"] as const;

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
  website: z.union([
    z.literal(""),
    z.string().trim().url("Enter a valid URL (include https://)"),
  ]),
  theme: z.enum(themeOptions),
  language: z.enum(languageOptions),
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

export const languageLabels: Record<(typeof languageOptions)[number], string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

export const themeLabels: Record<(typeof themeOptions)[number], string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};
