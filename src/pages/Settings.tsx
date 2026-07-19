import { SettingsForm } from "../components/settings/SettingsForm";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-indigo-600">Account</p>
        <h1 id="settings-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your profile, preferences, and notification settings.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SettingsForm />
      </div>
    </div>
  );
}
