import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LearnerQuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const qs = await prisma.mentorQuestion.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      idea: { select: { title: true, slug: true } },
      answers: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your mentor questions</h1>
        <p className="mt-2 text-slate-600">Track answers on ideas you explored.</p>
      </div>
      <ul className="space-y-6">
        {qs.map((q) => (
          <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase text-slate-500">{q.status}</p>
            <h2 className="text-lg font-semibold">{q.title}</h2>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{q.body}</p>
            {q.idea && (
              <p className="mt-2 text-xs">
                Idea:{" "}
                <Link href={`/ideas/${q.idea.slug}`} className="text-emerald-800 underline">
                  {q.idea.title}
                </Link>
              </p>
            )}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h3 className="text-sm font-medium text-slate-900">Answers</h3>
              {q.answers.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No replies yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {q.answers.map((a) => (
                    <li key={a.id} className="rounded-lg bg-emerald-50/60 px-3 py-2 text-sm">
                      <span className="font-medium">{a.author.name ?? "Mentor"}</span>: {a.body}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
