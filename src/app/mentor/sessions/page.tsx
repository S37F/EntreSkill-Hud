import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { MentorSessionStatus } from "@prisma/client";
import { updateSessionStatus } from "@/server/actions/mentor";

export default async function MentorSessionsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN"))
    redirect("/dashboard");

  const mentorId =
    session.user.role === "ADMIN"
      ? undefined
      : session.user.id;

  const sessions = await prisma.mentorSession.findMany({
    where: mentorId ? { mentorId } : {},
    orderBy: { startAt: "desc" },
    include: {
      learner: { select: { name: true, email: true } },
      mentor: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentoring sessions</h1>
        <p className="mt-2 text-slate-600">
          Confirm sessions you can honour; learners see status updates instantly.
        </p>
      </div>

      <ul className="space-y-4">
        {sessions.map((row) => (
          <li key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{row.learner.name ?? row.learner.email}</p>
                {session.user.role === "ADMIN" && (
                  <p className="text-xs text-slate-500">Mentor: {row.mentor.email}</p>
                )}
                <p className="text-sm text-slate-600">
                  {format(row.startAt, "PPpp")} — {format(row.endAt, "p")}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold">{row.status}</span>
            </div>
            {row.status === "REQUESTED" && (
              <div className="mt-3 flex gap-2">
                <StatusButton sid={row.id} status={MentorSessionStatus.CONFIRMED} label="Confirm" />
                <StatusButton sid={row.id} status={MentorSessionStatus.CANCELLED} label="Decline" />
              </div>
            )}
            {row.status === "CONFIRMED" && (
              <div className="mt-3">
                <StatusButton sid={row.id} status={MentorSessionStatus.COMPLETED} label="Mark completed" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusButton({
  sid,
  status,
  label,
}: {
  sid: string;
  status: MentorSessionStatus;
  label: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await updateSessionStatus(sid, status);
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
      >
        {label}
      </button>
    </form>
  );
}
