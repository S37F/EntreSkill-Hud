import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toggleBookmark, toggleStepComplete } from "@/server/actions/ideas";

type Props = { params: Promise<{ slug: string }> };

export default async function IdeaDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const idea = await prisma.businessIdea.findUnique({
    where: { slug, published: true },
    include: {
      steps: { orderBy: { order: "asc" } },
      skills: { include: { skill: true } },
      interests: { include: { interest: true } },
      resources: {
        include: {
          resource: true,
        },
      },
    },
  });

  if (!idea) notFound();

  const bookmarks = session?.user
    ? await prisma.bookmark.findMany({
        where: { userId: session.user.id, ideaId: idea.id },
        select: { ideaId: true },
      })
    : [];
  const bookmarked = bookmarks.length > 0;

  const doneSteps = session?.user
    ? new Set(
        (
          await prisma.userProgress.findMany({
            where: { userId: session.user.id, step: { ideaId: idea.id } },
            select: { stepId: true },
          })
        ).map((x) => x.stepId),
      )
    : new Set<string>();

  const approvedLinks = idea.resources.filter((l) => l.resource.status === "APPROVED");

  return (
    <article className="space-y-10">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-emerald-800">Roadmap overview</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{idea.title}</h1>
        <p className="mt-4 text-slate-700">{idea.description}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {idea.skills.map((s) => (
            <span key={s.skillId} className="rounded-full bg-slate-100 px-2 py-1 text-slate-800">
              {s.skill.name}
            </span>
          ))}
          {idea.interests.map((i) => (
            <span key={i.interestId} className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-900">
              {i.interest.name}
            </span>
          ))}
        </div>

        {session?.user ? (
          <form action={toggleBookmark.bind(null, idea.slug)} className="mt-6 inline-block">
            <button
              type="submit"
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              {bookmarked ? "Remove bookmark" : "Bookmark idea"}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-slate-600">
            <Link className="font-semibold text-emerald-800 underline" href="/login">
              Log in
            </Link>{" "}
            to bookmark and track roadmap progress.
          </p>
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Steps</h2>
        <ol className="space-y-6">
          {idea.steps.map((step) => (
            <li
              key={step.id}
              className={`rounded-2xl border px-5 py-4 ${
                doneSteps.has(step.id) ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    Step {step.order} · {step.stepType}
                  </span>
                  <h3 className="text-lg font-medium text-slate-900">{step.title}</h3>
                </div>
                {session?.user ? (
                  <form action={toggleStepComplete.bind(null, step.id, idea.slug)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                    >
                      {doneSteps.has(step.id) ? "Mark undone" : "Mark done ✓"}
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Curated resources for this idea</h2>
        {approvedLinks.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Linked resources appear here once published.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {approvedLinks.map((l) => (
              <li key={l.resourceId}>
                <Link href={`/resources/${l.resourceId}`} className="font-medium text-emerald-800 underline">
                  {l.resource.title}
                </Link>
                <span className="ml-2 text-slate-500">({l.resource.type})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session?.user && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-slate-900">Ask a mentor about this idea</h2>
          <form
            action={async (fd) => {
              "use server";
              const { askMentorQuestion } = await import("@/server/actions/mentor");
              await askMentorQuestion(
                String(fd.get("title")),
                String(fd.get("body")),
                null,
                idea.id,
              );
            }}
            className="space-y-3"
          >
            <input
              name="title"
              required
              placeholder="Short subject"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Your question (we’ll route it to available mentors)."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Submit question
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
