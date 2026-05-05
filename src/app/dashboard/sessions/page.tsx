import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function LearnerSessionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sessions = await prisma.mentorSession.findMany({
    where: { learnerId: session.user.id },
    orderBy: { startAt: "desc" },
    include: {
      mentor: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Session bookings</h1>
        <p className="mt-2 text-slate-600">Simple mentoring slots requested from the mentor profile.</p>
      </div>
      <ul className="space-y-4">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{s.mentor.name ?? s.mentor.email}</p>
                <Link href={`/mentors/${s.mentor.id}`} className="text-sm text-emerald-800 underline">
                  View mentor
                </Link>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold capitalize">
                {s.status.toLowerCase()}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {format(s.startAt, "PPpp")} — {format(s.endAt, "p")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
