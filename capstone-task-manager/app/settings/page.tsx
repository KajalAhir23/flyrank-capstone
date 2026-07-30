"use client";

import { useEffect, useState } from "react";
import { getTheme, applyTheme } from "@/lib/theme";
import { clearAllTasks, getTasks } from "@/lib/tasks";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [taskCount, setTaskCount] = useState(0);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setTheme(getTheme());
    setTaskCount(getTasks().length);
  }, []);

  function handleToggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }

  function handleClearTasks() {
    clearAllTasks();
    setTaskCount(0);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Preferences
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Settings
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div>
            <p className="font-medium text-[var(--foreground)]">Dark mode</p>
            <p className="text-sm text-[var(--muted)]">
              Switch between light and dark theme.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            className={`relative h-7 w-14 shrink-0 rounded-full transition-colors ${theme === "dark" ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${theme === "dark" ? "translate-x-7" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div>
            <p className="font-medium text-[var(--foreground)]">
              Clear all tasks
            </p>
            <p className="text-sm text-[var(--muted)]">
              {taskCount > 0
                ? `You currently have ${taskCount} task${taskCount === 1 ? "" : "s"}.`
                : "No tasks to clear."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearTasks}
            disabled={taskCount === 0}
            className="rounded-[var(--radius-md)] border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition-opacity hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cleared ? "✓ Cleared" : "Clear tasks"}
          </button>
        </div>
      </div>
    </section>
  );
}