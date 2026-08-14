"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
        !
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-slate-500">
        This page hit an unexpected error. You can try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
          Try again
        </button>
        <a href="/" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-900 hover:opacity-80">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
