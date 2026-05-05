import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { saveProfileFromForm } from "@/server/actions/profile";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [skills, interests, user] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.interest.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        userSkills: { select: { skillId: true } },
        userInterests: { select: { interestId: true } },
      },
    }),
  ]);

  const selectedSkills = new Set(user?.userSkills.map((x) => x.skillId));
  const selectedInts = new Set(user?.userInterests.map((x) => x.interestId));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Skills &amp; interests</h1>
        <p className="mt-2 text-slate-600">
          Tick what applies to you. We use overlaps with each business idea — no fancy AI needed for MVP.
        </p>
      </div>

      <form action={saveProfileFromForm} className="space-y-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Skills you already have</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {skills.map((s) => (
              <label key={s.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="skillIds"
                  value={s.id}
                  defaultChecked={selectedSkills.has(s.id)}
                  className="mt-1"
                />
                <span>{s.name}</span>
                {s.category && <span className="text-slate-400">({s.category})</span>}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Your interests</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {interests.map((i) => (
              <label key={i.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="interestIds"
                  value={i.id}
                  defaultChecked={selectedInts.has(i.id)}
                  className="mt-1"
                />
                {i.name}
              </label>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
