import { prisma } from "@/server/lib/prisma";

export default async function AdminFeedbackPage() {
  const rows = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">User feedback</h1>
      <ul className="space-y-3">
        {rows.map((f) => (
          <li key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold">Rating: {f.rating}/5</span>
              <span className="text-xs text-slate-500">
                {f.user ? (f.user.name ?? f.user.email) : "Anonymous"} · {f.createdAt.toISOString().slice(0, 10)}
              </span>
            </div>
            {f.comment && <p className="mt-2 text-sm text-slate-700">{f.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
