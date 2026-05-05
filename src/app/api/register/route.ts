import { prisma } from "@/server/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  intent: z.enum(["learn", "mentor"]).default("learn"),
});

export async function POST(req: Request) {
  try {
    const raw = schema.parse(await req.json());
    const role = raw.intent === "mentor" ? Role.MENTOR : Role.LEARNER;
    const email = raw.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(raw.password, 12);

    await prisma.user.create({
      data: {
        email,
        name: raw.name?.trim() || null,
        passwordHash,
        role,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not register. Check your inputs." }, { status: 400 });
  }
}
