"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "@/lib/tasks";

export default function NewTaskPage() {
  const [title, setTitle] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title);
    router.push("/tasks");
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Create
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          New Task
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          Add a task manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          autoFocus
          className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)]"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-fit rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Task
        </button>
      </form>
    </section>
  );
}