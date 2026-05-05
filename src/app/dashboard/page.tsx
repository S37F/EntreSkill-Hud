import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [ideasCount, bookmarks, completedSteps, userProfile] = await Promise.all([
    prisma.businessIdea.count({ where: { published: true } }),
    prisma.bookmark.count({ where: { userId: session.user.id } }),
    prisma.userProgress.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        userSkills: { select: { skillId: true } },
        userInterests: { select: { interestId: true } },
      },
    }),
  ]);

  const profileReady =
    (userProfile?.userSkills.length ?? 0) > 0 && (userProfile?.userInterests.length ?? 0) > 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}.
        </p>
      </div>

      {!profileReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Finish your skill and interest profile to unlock better idea matches —{" "}
          <Link className="font-semibold underline" href="/dashboard/profile">
            complete setup
          </Link>
          .
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Bookmarks</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{bookmarks}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Roadmap steps done</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{completedSteps}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Curated ideas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{ideasCount}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Next moves</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>
              <Link className="text-emerald-800 underline hover:text-emerald-900" href="/ideas">
                Review recommended ideas
              </Link>
            </li>
            <li>
              <Link className="text-emerald-800 underline hover:text-emerald-900" href="/resources">
                Open learning resources
              </Link>
            </li>
            <li>
              <Link className="text-emerald-800 underline hover:text-emerald-900" href="/mentors">
                Find a mentor
              </Link>
            </li>
            <li>
              <Link className="text-emerald-800 underline hover:text-emerald-900" href="/dashboard/questions">
                Your Q&A
              </Link>
            </li>
            <li>
              <Link className="text-emerald-800 underline hover:text-emerald-900" href="/dashboard/sessions">
                Session bookings
              </Link>
            </li>
          </ul>
        </div>
        <FeedbackCard />
      </div>
    </div>
  );
}

async function FeedbackCard() {
  return (
    <form
      action={async (fd) => {
        "use server";
        const { submitFeedback } = await import("@/server/actions/admin");
        const rating = Number(fd.get("rating"));
        const comment = fd.get("comment")?.toString();
        await submitFeedback(rating, comment);
      }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3"
    >
      <h2 className="font-semibold text-slate-900">Quick satisfaction check</h2>
      <p className="text-sm text-slate-600">
        Helps us tune content and mentorship (stored for admin KPI review).
      </p>
      <label className="block text-sm text-slate-700">
        Rating (1–5)
        <select name="rating" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" defaultValue={5}>
          <option value={1}>1 — struggling</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5 — very helpful</option>
        </select>
      </label>
      <label className="block text-sm text-slate-700">
        Comment (optional)
        <textarea
          name="comment"
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>
      <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Send feedback
      </button>
    </form>
  );
}
