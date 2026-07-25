async function getTodo() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  if (!response.ok) {
    throw new Error("Failed to fetch health data");
  }

  return response.json();
}

export default async function HealthPage() {
  const data = await getTodo();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Health Check
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Server fetch check
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          This page confirms that server-side data fetching is working in the deployed app.
        </p>
      </div>

      <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 shadow-inner sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Fetched JSON</p>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            Live response
          </span>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-[var(--foreground)]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
}
