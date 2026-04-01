import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: auth.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.postLike.create({ data: { postId: id, userId: auth.id } });
  return NextResponse.json({ liked: true });
}
