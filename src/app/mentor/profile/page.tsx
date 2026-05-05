import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { upsertMentorProfile } from "@/server/actions/mentor";

export default async function MentorProfileEditorPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN"))
    redirect("/dashboard");

  const [skills, profile] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
      include: { expertise: true },
    }),
  ]);

  const selected = new Set(profile?.expertise.map((s) => s.id));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentor profile</h1>
        <p className="mt-2 text-slate-600">Visible to learners once admins mark you verified.</p>
      </div>

      <form action={upsertMentorProfile} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Headline (optional)
          <input
            name="headline"
            defaultValue={profile?.headline ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Bio *
          <textarea
            name="bio"
            required
            rows={6}
            defaultValue={profile?.bio ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Experience notes
          <textarea
            name="experience"
            rows={4}
            defaultValue={profile?.experience ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <div>
          <p className="text-sm font-medium">Expert tags *</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {skills.map((s) => (
              <label key={s.id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="skillIds"
                  value={s.id}
                  defaultChecked={selected.has(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white">
          Save profile
        </button>
      </form>
    </div>
  );
}
