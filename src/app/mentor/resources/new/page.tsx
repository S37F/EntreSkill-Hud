import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { createLearningResource } from "@/server/actions/resources";
import Link from "next/link";

export default async function NewResourcePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN"))
    redirect("/dashboard");

  const ideas = await prisma.businessIdea.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit a learning resource</h1>
        <p className="mt-2 text-sm text-slate-600">
          Submissions stay in <strong>PENDING</strong> until an admin approves them.
        </p>
      </div>

      <form
        action={async (fd) => {
          "use server";
          await createLearningResource(fd);
        }}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block text-sm font-medium">
          Title *
          <input name="title" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          URL (video or article link; optional for drafts)
          <input name="url" type="url" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Type *
          <select name="type" defaultValue="VIDEO" className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="VIDEO">Video</option>
            <option value="ARTICLE">Article</option>
            <option value="CHECKLIST">Checklist</option>
          </select>
        </label>
        <div>
          <p className="text-sm font-medium">Link to business ideas</p>
          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border px-3 py-2">
            {ideas.map((idea) => (
              <label key={idea.id} className="flex gap-2 text-sm leading-tight">
                <input type="checkbox" name="ideaIds" value={idea.id} />
                {idea.title}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded-xl bg-emerald-700 px-5 py-2 font-semibold text-white">
          Submit for review
        </button>
        <p className="text-sm">
          <Link href="/resources" className="text-emerald-800 underline">
            Browse library →
          </Link>
        </p>
      </form>
    </div>
  );
}
