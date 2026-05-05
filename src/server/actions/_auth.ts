"use server";

import { auth } from "@/server/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function requireLogin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRoles(...roles: Role[]) {
  const session = await requireLogin();
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
