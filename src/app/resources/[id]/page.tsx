import { prisma } from "@/server/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bumpResourceView } from "@/server/actions/resources";
import { auth } from "@/server/auth";

type Props = { params: Promise<{ id: string }> };

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const resource = await prisma.learningResource.findUnique({
    where: { id },
    include: {
      ideas: { include: { idea: true } },
      author: { select: { name: true } },
    },
  });

  if (!resource) notFound();

  const canSee =
    resource.status === "APPROVED" ||
    session?.user.role === "ADMIN" ||
    (session?.user.role === "MENTOR" && resource.authorId === session.user.id);

  if (!canSee) notFound();

  await bumpResourceView(id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm text-slate-500">{resource.type}</p>
        <h1 className="text-3xl font-bold text-slate-900">{resource.title}</h1>
        {resource.description && <p className="mt-4 text-slate-700">{resource.description}</p>}
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Open link
          </a>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No external URL on file — contact admin for the asset.</p>
        )}
        <p className="mt-4 text-xs text-slate-500">Views counted (including refreshes).</p>
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">Related ideas</h2>
        <ul className="mt-2 text-sm">
          {resource.ideas.map((link) => (
            <li key={link.ideaId}>
              <Link href={`/ideas/${link.idea.slug}`} className="text-emerald-800 underline">
                {link.idea.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
