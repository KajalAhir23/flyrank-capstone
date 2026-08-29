"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm shadow-slate-200/60 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-hidden="true"
          tabIndex={-1}
          className="rounded-full px-2 py-1 text-lg font-semibold tracking-tight text-[var(--foreground)] transition hover:text-[var(--accent)]"
        >
          TaskFlow
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-[var(--muted)] sm:gap-2">
          {links.map(({ href, label }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-2 transition ${isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
