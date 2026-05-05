import { prisma } from "@/server/lib/prisma";
import { auth } from "@/server/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
type Props = { params: Promise<{ userId: string }> };

export default async function MentorDetailPage({ params }: Props) {
  const { userId } = await params;
  const session = await auth();

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      expertise: true,
    },
  });

  if (!profile) notFound();

  const canPreviewUnverified =
    session?.user.role === "ADMIN" || session?.user?.id === userId;

  if (!profile.verified && !canPreviewUnverified) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{profile.user.name ?? profile.user.email}</h1>
        {profile.headline && (
          <p className="mt-2 text-lg font-medium text-emerald-900">{profile.headline}</p>
        )}
        <div className="mt-4 flex gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 ${profile.verified ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
            {profile.verified ? "Verified mentor" : "Pending verification"}
          </span>
        </div>
        <p className="mt-6 whitespace-pre-wrap text-slate-700">{profile.bio}</p>
        {profile.experience && (
          <div className="mt-6">
            <h2 className="font-semibold text-slate-900">Experience highlights</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{profile.experience}</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="font-semibold text-slate-900">Expert areas</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.expertise.map((s) => (
            <span key={s.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {s.name}
            </span>
          ))}
        </div>
      </section>

      {session?.user && session.user.id !== profile.userId && session.user.role === "LEARNER" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Book a guidance session</h2>
          <p className="text-sm text-slate-600">
            Pick overlapping start/end (local timezone). Mentor confirms or declines.
          </p>
          <form
            action={async (fd) => {
              "use server";
              const { requestMentorSession } = await import("@/server/actions/mentor");
              await requestMentorSession(
                profile.userId,
                fd.get("start")?.toString() ?? "",
                fd.get("end")?.toString() ?? "",
              );
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="block text-sm text-slate-700">
              Start (local)
              <input required type="datetime-local" name="start" className="mt-1 w-full rounded-lg border px-2 py-1" />
            </label>
            <label className="block text-sm text-slate-700">
              End (local)
              <input required type="datetime-local" name="end" className="mt-1 w-full rounded-lg border px-2 py-1" />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Request session
            </button>
          </form>
          <Link href={`/dashboard/sessions`} className="inline-block text-sm text-emerald-800 underline">
            View your bookings
          </Link>
        </section>
      ) : !session?.user ? (
        <p className="text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-emerald-800 underline">
            Log in as a learner
          </Link>{" "}
          to book or ask questions directed to this mentor.
        </p>
      ) : null}

      {session?.user &&
        session.user.id !== profile.userId &&
        (session.user.role === "LEARNER" || session.user.role === "ADMIN") && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-slate-900">Direct question</h2>
            <form
              action={async (fd) => {
                "use server";
                const { askMentorQuestion } = await import("@/server/actions/mentor");
                await askMentorQuestion(
                  String(fd.get("title")),
                  String(fd.get("body")),
                  profile.userId,
                  null,
                );
              }}
              className="space-y-3"
            >
              <input
                name="title"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Subject"
              />
              <textarea
                name="body"
                required
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Your question"
              />
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Ask this mentor
              </button>
            </form>
          </section>
        )}
    </div>
  );
}
