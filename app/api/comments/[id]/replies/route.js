import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const reply = await prisma.reply.create({
    data: { content, commentId: params.id, authorId: auth.id },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json({ ...reply, liked: false, likeCount: 0 });
}
