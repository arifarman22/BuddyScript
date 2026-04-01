import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.replyLike.findUnique({
    where: { replyId_userId: { replyId: params.id, userId: auth.id } },
  });

  if (existing) {
    await prisma.replyLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.replyLike.create({ data: { replyId: params.id, userId: auth.id } });
  return NextResponse.json({ liked: true });
}
