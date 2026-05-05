import { prisma } from "@/server/lib/prisma";
import { setMentorVerified } from "@/server/actions/admin";

export default async function AdminMentorsPage() {
  const mentors = await prisma.mentorProfile.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mentors</h1>
      <ul className="space-y-4">
        {mentors.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-slate-900">{m.user.name ?? m.user.email}</p>
              <p className={`text-xs font-semibold ${m.verified ? "text-emerald-800" : "text-amber-800"}`}>
                {m.verified ? "Verified" : "Pending"}
              </p>
            </div>
            {!m.verified ? (
              <form
                action={async () => {
                  "use server";
                  await setMentorVerified(m.userId, true);
                }}
              >
                <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white">
                  Verify
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await setMentorVerified(m.userId, false);
                }}
              >
                <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
                  Revoke verification
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
