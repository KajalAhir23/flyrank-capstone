export default function NewTaskPage() {
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
          This page will let the user create a task.
        </p>
      </div>
    </section>
  );
}
