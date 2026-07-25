const statCards = [
  { label: "Total Tasks", value: "0" },
  { label: "Completed", value: "0" },
  { label: "Pending", value: "0" },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/70 sm:p-8 lg:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
          Welcome to your task workspace. This placeholder view will soon show key task insights.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-5"
          >
            <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
