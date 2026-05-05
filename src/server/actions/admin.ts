"use server";

import { prisma } from "@/server/lib/prisma";
import { requireRoles } from "./_auth";
import { Role, RoadmapStepType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setMentorVerified(userId: string, verified: boolean) {
  await requireRoles(Role.ADMIN);

  await prisma.mentorProfile.update({
    where: { userId },
    data: { verified },
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
}

export async function createBusinessIdea(formData: FormData) {
  await requireRoles(Role.ADMIN);
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const description = String(formData.get("description") ?? "").trim();
  const skillIds = formData.getAll("skillIds").map(String).filter(Boolean);
  const interestIds = formData.getAll("interestIds").map(String).filter(Boolean);

  if (!title || !slug || !description) throw new Error("Missing fields");

  await prisma.businessIdea.create({
    data: {
      slug,
      title,
      description,
      skills:
        skillIds.length > 0
          ? { create: skillIds.map((skillId) => ({ skillId })) }
          : undefined,
      interests:
        interestIds.length > 0
          ? { create: interestIds.map((interestId) => ({ interestId })) }
          : undefined,
      steps: {
        create: [
          {
            order: 1,
            title: "Idea validation",
            stepType: RoadmapStepType.VALIDATION,
            body: "Describe how you validated demand locally.",
          },
        ],
      },
    },
  });

  revalidatePath("/ideas");
  revalidatePath("/admin/ideas");
  redirect("/admin/ideas");
}

export async function submitFeedback(rating: number, comment?: string | null) {
  const session = await (await import("./_auth")).requireLogin();
  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      rating,
      comment: comment?.trim() || null,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/feedback");
}
