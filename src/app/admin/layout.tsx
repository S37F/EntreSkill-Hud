import Link from "next/link";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      <nav className="-mt-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin">
          KPIs
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin/users">
          Users
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin/mentors">
          Mentors
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin/resources">
          Resource approvals
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin/ideas">
          Business ideas
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/admin/feedback">
          Feedback
        </Link>
      </nav>
      {children}
    </div>
  );
}
