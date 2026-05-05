"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-white px-8 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-800">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn&apos;t load this page</h1>
      <p className="mt-3 text-slate-600">
        Try again in a moment. If you were saving data, check your connection then retry.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Home
        </Link>
      </div>
    </div>
  );
}
