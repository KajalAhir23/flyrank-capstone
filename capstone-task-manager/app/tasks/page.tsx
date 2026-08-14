"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTasks, toggleTask, deleteTask, subscribeToTasks, type Task } from "@/lib/tasks";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks());
    const unsubscribe = subscribeToTasks(() => setTasks(getTasks()));
    return unsubscribe;
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            Tasks
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Tasks
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            {tasks.length === 0
              ? "No tasks yet. Add some from the AI assistant, or create one manually."
              : `${tasks.filter((t) => !t.completed).length} pending, ${tasks.filter((t) => t.completed).length} completed.`}
          </p>
        </div>

        <Link
          href="/tasks/new"
          className="shrink-0 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + New Task
        </Link>
      </div>

      {tasks.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--background)] p-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg text-[var(--accent)]">
            ✓
          </div>
          <p className="font-medium text-[var(--foreground)]">No tasks yet</p>
          <p className="max-w-xs text-sm text-[var(--muted)]">
            Ask the AI assistant to plan something, or add your first task manually.
          </p>
          <div className="mt-2 flex gap-2">
            <Link
              href="/chat"
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Chat with AI
            </Link>
            <Link
              href="/tasks/new"
              className="rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:opacity-80"
            >
              Add manually
            </Link>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 accent-[var(--accent)]"
              />
              <p
                className={`flex-1 text-sm ${
                  task.completed
                    ? "text-[var(--muted)] line-through"
                    : "text-[var(--foreground)]"
                }`}
              >
                {task.title}
              </p>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="text-xs font-medium text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}