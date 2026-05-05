"use server";

import { prisma } from "@/server/lib/prisma";
import { requireRoles } from "./_auth";
import { ResourceStatus, ResourceType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function bumpResourceView(resourceId: string) {
  await prisma.learningResource.update({
    where: { id: resourceId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function createLearningResource(formData: FormData) {
  const session = await requireRoles(Role.MENTOR, Role.ADMIN);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "ARTICLE");
  const type = typeRaw as ResourceType;
  const urlRaw = String(formData.get("url") ?? "").trim();
  const url = urlRaw === "" ? null : urlRaw;
  const ideaIds = formData.getAll("ideaIds").map(String).filter(Boolean);

  if (!title) throw new Error("Title required");
  if (!["VIDEO", "ARTICLE", "CHECKLIST"].includes(type)) throw new Error("Invalid type");

  const resource = await prisma.learningResource.create({
    data: {
      title,
      description: description || null,
      type,
      url,
      authorId: session.user.id,
      status: ResourceStatus.PENDING,
      ideas:
        ideaIds.length > 0
          ? {
              create: ideaIds.map((ideaId) => ({
                idea: { connect: { id: ideaId } },
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/mentor/resources/new");
  revalidatePath("/admin/resources");

  redirect(`/resources/${resource.id}`);
}

export async function approveResource(resourceId: string, approved: boolean) {
  await requireRoles(Role.ADMIN);
  await prisma.learningResource.update({
    where: { id: resourceId },
    data: { status: approved ? ResourceStatus.APPROVED : ResourceStatus.REJECTED },
  });
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}
