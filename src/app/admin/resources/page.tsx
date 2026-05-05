import { prisma } from "@/server/lib/prisma";
import Link from "next/link";
import { approveResource } from "@/server/actions/resources";

export default async function AdminResourcesPage() {
  const pending = await prisma.learningResource.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Pending resources</h1>
      <ul className="space-y-4">
        {pending.map((r) => (
          <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-slate-500">
                  {r.type} · {r.author ? (r.author.name ?? r.author.email) : "Unknown author"}
                </p>
                {r.description && <p className="mt-2 text-sm text-slate-600">{r.description}</p>}
                {r.url && (
                  <p className="mt-1 text-xs">
                    <a href={r.url} className="text-emerald-800 underline" target="_blank" rel="noreferrer">
                      Open URL
                    </a>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await approveResource(r.id, true);
                  }}
                >
                  <button type="submit" className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white">
                    Approve
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await approveResource(r.id, false);
                  }}
                >
                  <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm font-medium">
                    Reject
                  </button>
                </form>
              </div>
            </div>
            <Link href={`/resources/${r.id}`} className="mt-2 inline-block text-xs text-emerald-800 underline">
              Preview page
            </Link>
          </li>
        ))}
      </ul>
      {pending.length === 0 && <p className="text-sm text-slate-600">No pending submissions.</p>}
    </div>
  );
}
