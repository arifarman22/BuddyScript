import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  return res;
}
