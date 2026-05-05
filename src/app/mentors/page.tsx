import { prisma } from "@/server/lib/prisma";
import Link from "next/link";

export default async function MentorsDirectoryPage() {
  const mentors = await prisma.mentorProfile.findMany({
    where: { verified: true },
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      expertise: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mentor directory</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Verified mentors with practical experience. Reach out asynchronously or book a mentoring slot — live video integrations can come later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mentors.map((m) => (
          <article key={m.userId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{m.user.name ?? m.user.email}</h2>
            {m.headline && <p className="mt-1 text-sm font-medium text-emerald-900">{m.headline}</p>}
            <p className="mt-3 line-clamp-4 text-sm text-slate-600">{m.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1 text-xs">
              {m.expertise.map((s) => (
                <span key={s.id} className="rounded-full bg-slate-100 px-2 py-0.5">
                  {s.name}
                </span>
              ))}
            </div>
            <Link
              href={`/mentors/${m.user.id}`}
              className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              View profile · Q&amp;A · book
            </Link>
          </article>
        ))}
      </div>

      {mentors.length === 0 && (
        <p className="text-sm text-slate-600">
          Verified mentors appear here once an administrator verifies them — check back soon.
        </p>
      )}
    </div>
  );
}
