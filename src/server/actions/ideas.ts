"use server";

import { prisma } from "@/server/lib/prisma";
import { requireLogin } from "./_auth";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(ideaSlug: string) {
  const session = await requireLogin();
  const idea = await prisma.businessIdea.findUnique({
    where: { slug: ideaSlug },
  });
  if (!idea) throw new Error("Idea not found");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_ideaId: { userId: session.user.id, ideaId: idea.id } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_ideaId: { userId: session.user.id, ideaId: idea.id } },
    });
  } else {
    await prisma.bookmark.create({
      data: { userId: session.user.id, ideaId: idea.id },
    });
  }
  revalidatePath(`/ideas/${ideaSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/ideas");
}

export async function toggleStepComplete(stepId: string, ideaSlug: string) {
  const session = await requireLogin();
  const step = await prisma.roadmapStep.findUnique({
    where: { id: stepId },
    include: { idea: true },
  });
  if (!step || step.idea.slug !== ideaSlug) throw new Error("Invalid step");

  const existing = await prisma.userProgress.findUnique({
    where: {
      userId_stepId: { userId: session.user.id, stepId },
    },
  });

  if (existing) {
    await prisma.userProgress.delete({
      where: { userId_stepId: { userId: session.user.id, stepId } },
    });
  } else {
    await prisma.userProgress.create({
      data: { userId: session.user.id, stepId },
    });
  }
  revalidatePath(`/ideas/${ideaSlug}`);
  revalidatePath("/dashboard");
}
