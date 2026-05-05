import { prisma } from "@/server/lib/prisma";
import Link from "next/link";

export default async function AdminIdeasPage() {
  const ideas = await prisma.businessIdea.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { steps: true, bookmarks: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Business ideas</h1>
        <Link
          href="/admin/ideas/new"
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Add idea
        </Link>
      </div>
      <ul className="space-y-3">
        {ideas.map((i) => (
          <li key={i.id} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="font-semibold text-slate-900">{i.title}</p>
              <p className="text-xs text-slate-500">
                {i.published ? "Published" : "Draft"} · {i._count.steps} steps · {i._count.bookmarks} bookmarks
              </p>
            </div>
            <Link href={`/ideas/${i.slug}`} className="text-sm text-emerald-800 underline">
              View public page
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
