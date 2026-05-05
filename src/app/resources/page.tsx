import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { ResourceStatus } from "@prisma/client";
import Link from "next/link";

export default async function ResourcesPage() {
  const session = await auth();
  const admin = session?.user.role === "ADMIN";

  const resources = await prisma.learningResource.findMany({
    where: admin ? {} : { status: ResourceStatus.APPROVED },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      ideas: {
        include: { idea: { select: { title: true, slug: true } } },
      },
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Learning resources</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Videos, articles, and downloadable checklists. Mentor uploads stay pending until an administrator approves them.
        </p>
      </div>

      <div className="space-y-4">
        {resources.map((r) => (
          <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{r.title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{r.type}</span>
              {r.status !== "APPROVED" && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                  {r.status}
                </span>
              )}
            </div>
            {r.description && <p className="mt-2 text-sm text-slate-600">{r.description}</p>}
            <p className="mt-2 text-xs text-slate-500">
              {r.author ? `By ${r.author.name ?? r.author.email}` : "Platform curated"} · Views: {r.viewCount}
            </p>
            {r.ideas.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                Linked ideas:{" "}
                {r.ideas.map((x, idx) => (
                  <span key={x.ideaId}>
                    <Link href={`/ideas/${x.idea.slug}`} className="text-emerald-800 underline">
                      {x.idea.title}
                    </Link>
                    {idx < r.ideas.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}
            <Link
              href={`/resources/${r.id}`}
              className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline"
            >
              Open resource →
            </Link>
          </article>
        ))}
      </div>

      {(session?.user.role === "MENTOR" || session?.user.role === "ADMIN") && (
        <Link
          href="/mentor/resources/new"
          className="inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Upload new resource (mentor)
        </Link>
      )}
    </div>
  );
}
