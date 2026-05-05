import Link from "next/link";
import type { ReactNode } from "react";

export default function MentorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      <nav className="-mt-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/mentor/dashboard">
          Overview
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/mentor/profile">
          Profile
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/mentor/resources/new">
          Upload resource
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/mentor/questions">
          Q&amp;A inbox
        </Link>
        <Link className="rounded-lg px-3 py-1 hover:bg-slate-100" href="/mentor/sessions">
          Sessions
        </Link>
      </nav>
      {children}
    </div>
  );
}
