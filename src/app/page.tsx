import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
            Skill → startup enablement
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Turn what you already know into a confident micro-business.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            EntreSkill Hub matches your skills and interests to curated business ideas, step-by-step roadmaps, beginner-friendly resources, and verified mentors — without scattered internet guesswork.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Get started free
            </Link>
            <Link href="/ideas" className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
              Browse ideas
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">What you&apos;ll access</h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="text-emerald-700">●</span>
              Personalized business idea picks based on your skills and interests
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700">●</span>
              Startup roadmaps: validation, tools, registration, costing, marketing
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700">●</span>
              Videos, articles, and printable checklists (mentor-reviewed)
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700">●</span>
              Mentor directory with Q&A and simple session bookings
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
