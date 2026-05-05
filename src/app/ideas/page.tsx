import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { scoreIdeaForUser } from "@/server/lib/recommend";
import Link from "next/link";

export default async function IdeasPage() {
  const session = await auth();

  const userSkills = session?.user
    ? (
        await prisma.userSkill.findMany({
          where: { userId: session.user.id },
          select: { skillId: true },
        })
      ).map((x) => x.skillId)
    : [];
  const userInterests = session?.user
    ? (
        await prisma.userInterest.findMany({
          where: { userId: session.user.id },
          select: { interestId: true },
        })
      ).map((x) => x.interestId)
    : [];

  const rawIdeas = await prisma.businessIdea.findMany({
    where: { published: true },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { interest: true } },
    },
    orderBy: { title: "asc" },
  });

  const scored = rawIdeas
    .map((idea) => ({
      idea,
      score: scoreIdeaForUser(
        userSkills,
        userInterests,
        idea.skills.map((x) => ({ skillId: x.skillId })),
        idea.interests.map((x) => ({ interestId: x.interestId })),
      ),
    }))
    .sort((a, b) => {
      const d = b.score - a.score;
      if (d !== 0) return d;
      return a.idea.title.localeCompare(b.idea.title);
    });

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Business ideas</h1>
        <p className="mt-2 text-slate-600">
          {session?.user ? (
            <>
              Sorted by overlap with{" "}
              <Link href="/dashboard/profile" className="underline text-emerald-800">
                your profile
              </Link>
              . Higher scores are a better starting fit — still validate locally.
            </>
          ) : (
            <>
              Signed-out view (alphabetical).{" "}
              <Link href="/login" className="underline text-emerald-800">
                Log in
              </Link>{" "}
              for personalized picks.
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scored.map(({ idea, score }) => (
          <article
            key={idea.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{idea.title}</h2>
              {session?.user && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900">
                  Match score: {score}
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-4 flex-1 text-sm text-slate-600">{idea.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {idea.skills.map((s) => (
                <span key={s.skillId} className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                  {s.skill.name}
                </span>
              ))}
              {idea.interests.map((i) => (
                <span
                  key={i.interestId}
                  className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-900"
                >
                  {i.interest.name}
                </span>
              ))}
            </div>
            <Link
              href={`/ideas/${idea.slug}`}
              className="mt-5 inline-flex w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Open roadmap →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
