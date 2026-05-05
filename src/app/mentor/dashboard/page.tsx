import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN"))
    redirect("/dashboard");

  const [profile, openQs, upcoming] = await Promise.all([
    prisma.mentorProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.mentorQuestion.count({
      where: {
        status: "OPEN",
        OR: [{ mentorId: session.user.id }, { mentorId: null }],
      },
    }),
    prisma.mentorSession.count({
      where: {
        mentorId: session.user.id,
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mentor workspace</h1>
        <p className="mt-2 text-slate-600">Track mentees, resources, and mentoring requests.</p>
      </div>

      {!profile?.verified && session.user.role !== "ADMIN" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your profile exists but is awaiting admin verification before you appear publicly in the mentor directory.
        </div>
      )}

      {!profile && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-slate-700">Create your mentor biography and expertise tags first.</p>
          <Link href="/mentor/profile" className="mt-3 inline-block font-semibold text-emerald-800 underline">
            Set up mentor profile
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open mentor questions</p>
          <p className="mt-2 text-3xl font-semibold">{openQs}</p>
          <Link href="/mentor/questions" className="mt-3 inline-block text-sm text-emerald-800 underline">
            Open inbox
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active session requests</p>
          <p className="mt-2 text-3xl font-semibold">{upcoming}</p>
          <Link href="/mentor/sessions" className="mt-3 inline-block text-sm text-emerald-800 underline">
            Manage sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
