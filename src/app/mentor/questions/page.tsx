import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function MentorQuestionsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN"))
    redirect("/dashboard");

  const uid = session.user.id;

  const questions = await prisma.mentorQuestion.findMany({
    where: {
      status: "OPEN",
      OR: [{ mentorId: uid }, { mentorId: null }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { name: true, email: true } },
      idea: { select: { title: true, slug: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Q&amp;A inbox</h1>
        <p className="mt-2 text-slate-600">
          General pool (unassigned) plus questions addressed directly to you.
        </p>
      </div>

      <ul className="space-y-6">
        {questions.map((q) => (
          <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>From {q.author.name ?? q.author.email}</span>
              {q.idea && (
                <Link href={`/ideas/${q.idea.slug}`} className="text-emerald-800 underline">
                  {q.idea.title}
                </Link>
              )}
            </div>
            <h2 className="mt-2 text-lg font-semibold">{q.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{q.body}</p>
            <form
              action={async (fd) => {
                "use server";
                const { answerMentorQuestion } = await import("@/server/actions/mentor");
                await answerMentorQuestion(q.id, fd.get("body")?.toString().trim() ?? "");
              }}
              className="mt-4 space-y-2 border-t border-slate-100 pt-4"
            >
              <label className="block text-sm font-medium">
                Your answer
                <textarea name="body" required rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </label>
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Publish answer
              </button>
            </form>
          </li>
        ))}
      </ul>

      {questions.length === 0 && <p className="text-sm text-slate-600">You’re caught up.</p>}
    </div>
  );
}
