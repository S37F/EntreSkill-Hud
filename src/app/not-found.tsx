import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        That link may be broken or the page was moved. Try the home page or browse ideas.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Home
        </Link>
        <Link href="/ideas" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Business ideas
        </Link>
      </div>
    </div>
  );
}
