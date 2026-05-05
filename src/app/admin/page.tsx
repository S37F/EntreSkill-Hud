import { prisma } from "@/server/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    users,
    ideas,
    completedSteps,
    totalSteps,
    resourcesViewed,
    sessions,
    feedbackAvg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.businessIdea.count({ where: { published: true } }),
    prisma.userProgress.count(),
    prisma.roadmapStep.count(),
    prisma.learningResource.aggregate({ _sum: { viewCount: true } }),
    prisma.mentorSession.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.feedback.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  const roadmapCompletionRate =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Engagement overview</h1>
        <p className="mt-2 text-slate-600">PRD-style KPI snapshot (single-tenant demo numbers).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi title="Registered users" value={users} />
        <Kpi title="Published ideas" value={ideas} />
        <Kpi
          title="Roadmap step completions (total)"
          value={completedSteps}
          hint={`Indexed completion vs total steps ≈ ${roadmapCompletionRate}% (rough)`}
        />
        <Kpi title="Resource views (sum)" value={resourcesViewed._sum.viewCount ?? 0} />
        <Kpi title="Mentor sessions (non-cancelled)" value={sessions} />
        <Kpi
          title="Avg satisfaction (1–5)"
          value={feedbackAvg._avg.rating?.toFixed(2) ?? "—"}
          hint={`${feedbackAvg._count} responses`}
        />
      </div>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
