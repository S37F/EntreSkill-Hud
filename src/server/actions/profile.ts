"use server";

import { prisma } from "@/server/lib/prisma";
import { requireLogin } from "./_auth";

export async function saveUserProfile(skillIds: string[], interestIds: string[]) {
  const session = await requireLogin();
  const uid = session.user.id;

  await prisma.$transaction([
    prisma.userSkill.deleteMany({ where: { userId: uid } }),
    prisma.userInterest.deleteMany({ where: { userId: uid } }),
    prisma.userSkill.createMany({
      data: skillIds.map((skillId) => ({ userId: uid, skillId })),
      skipDuplicates: true,
    }),
    prisma.userInterest.createMany({
      data: interestIds.map((interestId) => ({ userId: uid, interestId })),
      skipDuplicates: true,
    }),
  ]);
}

export async function saveProfileFromForm(formData: FormData) {
  const skillIds = formData.getAll("skillIds").map(String).filter(Boolean);
  const interestIds = formData.getAll("interestIds").map(String).filter(Boolean);
  await saveUserProfile(skillIds, interestIds);
}
