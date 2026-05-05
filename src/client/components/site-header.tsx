import { auth } from "@/server/auth";
import { signOutAction } from "@/server/actions/sign-out";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-emerald-800">
          EntreSkill Hub
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/ideas">
            Business ideas
          </Link>
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/resources">
            Learning
          </Link>
          <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/mentors">
            Mentors
          </Link>

          {session?.user ? (
            <>
              <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/dashboard">
                Dashboard
              </Link>
              {(session.user.role === "MENTOR" || session.user.role === "ADMIN") && (
                <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/mentor/dashboard">
                  Mentor
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link className="rounded-md px-2 py-1 hover:bg-slate-100" href="/admin">
                  Admin
                </Link>
              )}
              <span className="mx-1 text-slate-400">|</span>
              <span className="text-slate-500">{session.user.name ?? session.user.email}</span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-800 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="rounded-md px-2 py-1 font-medium text-emerald-800 hover:bg-emerald-50"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-md bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800"
                href="/register"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
