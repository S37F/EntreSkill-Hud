"use server";

import { prisma } from "@/server/lib/prisma";
import { MentorSessionStatus, QuestionStatus } from "@prisma/client";
import { requireRoles } from "./_auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertMentorProfile(formData: FormData) {
  const session = await requireRoles(Role.MENTOR, Role.ADMIN);
  const uid = session.user.id;

  const bio = String(formData.get("bio") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const skillIds = formData.getAll("skillIds").map(String).filter(Boolean);

  if (!bio) throw new Error("Bio required");

  await prisma.mentorProfile.upsert({
    where: { userId: uid },
    create: {
      userId: uid,
      bio,
      headline: headline || null,
      experience: experience || null,
      expertise: skillIds.length ? { connect: skillIds.map((id) => ({ id })) } : undefined,
    },
    update: {
      bio,
      headline: headline || null,
      experience: experience || null,
      expertise: { set: skillIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/mentors");
  revalidatePath(`/mentors/${uid}`);
  revalidatePath("/mentor/profile");
}

export async function requestMentorSession(mentorId: string, startIso: string, endIso: string) {
  const { requireLogin } = await import("./_auth");
  const session = await requireLogin();

  const startAt = new Date(startIso);
  const endAt = new Date(endIso);
  if (Number.isNaN(+startAt) || Number.isNaN(+endAt) || endAt <= startAt) {
    throw new Error("Invalid time range");
  }

  await prisma.mentorSession.create({
    data: {
      mentorId,
      learnerId: session.user.id,
      startAt,
      endAt,
      status: MentorSessionStatus.REQUESTED,
    },
  });

  revalidatePath("/dashboard/sessions");
  revalidatePath("/mentor/sessions");
  revalidatePath(`/mentors/${mentorId}`);
}

export async function updateSessionStatus(sessionId: string, status: MentorSessionStatus) {
  const authSession = await requireRoles(Role.MENTOR, Role.ADMIN);
  const row = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
  });
  if (
    !row ||
    (authSession.user.role === Role.MENTOR && row.mentorId !== authSession.user.id)
  ) {
    throw new Error("Not found");
  }

  await prisma.mentorSession.update({
    where: { id: sessionId },
    data: { status },
  });

  revalidatePath("/dashboard/sessions");
  revalidatePath("/mentor/sessions");
}

export async function askMentorQuestion(
  title: string,
  body: string,
  mentorUserId?: string | null,
  ideaId?: string | null,
) {
  const { requireLogin } = await import("./_auth");
  const session = await requireLogin();
  await prisma.mentorQuestion.create({
    data: {
      authorId: session.user.id,
      mentorId: mentorUserId || null,
      ideaId: ideaId || null,
      title,
      body,
    },
  });
  revalidatePath("/dashboard/questions");
  revalidatePath("/mentor/questions");
}

export async function answerMentorQuestion(questionId: string, body: string) {
  const authSession = await requireRoles(Role.MENTOR, Role.ADMIN);
  const q = await prisma.mentorQuestion.findUnique({
    where: { id: questionId },
  });
  if (!q) throw new Error("Question not found");
  if (
    authSession.user.role === Role.MENTOR &&
    q.mentorId &&
    q.mentorId !== authSession.user.id
  ) {
    throw new Error("Wrong mentor");
  }

  await prisma.$transaction([
    prisma.mentorAnswer.create({
      data: { questionId, authorId: authSession.user.id, body },
    }),
    prisma.mentorQuestion.update({
      where: { id: questionId },
      data: { status: QuestionStatus.ANSWERED },
    }),
  ]);

  revalidatePath("/dashboard/questions");
  revalidatePath("/mentor/questions");
}
