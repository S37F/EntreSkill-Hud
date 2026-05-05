import { prisma } from "@/server/lib/prisma";
import { createBusinessIdea } from "@/server/actions/admin";

export default async function AdminNewIdeaPage() {
  const [skills, interests] = await Promise.all([
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
    prisma.interest.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">New business idea</h1>
      <form action={createBusinessIdea} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Title *
          <input name="title" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Slug * (url-safe, lower-case)
          <input name="slug" required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="e.g. mobile-snack-cart" />
        </label>
        <label className="block text-sm font-medium">
          Description *
          <textarea name="description" required rows={5} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <div>
          <p className="text-sm font-medium">Skills</p>
          <div className="mt-2 grid max-h-40 gap-2 overflow-y-auto sm:grid-cols-2">
            {skills.map((s) => (
              <label key={s.id} className="flex gap-2 text-sm">
                <input type="checkbox" name="skillIds" value={s.id} />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Interests</p>
          <div className="mt-2 grid max-h-40 gap-2 overflow-y-auto sm:grid-cols-2">
            {interests.map((i) => (
              <label key={i.id} className="flex gap-2 text-sm">
                <input type="checkbox" name="interestIds" value={i.id} />
                {i.name}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white">
          Create (with starter roadmap step)
        </button>
      </form>
    </div>
  );
}
