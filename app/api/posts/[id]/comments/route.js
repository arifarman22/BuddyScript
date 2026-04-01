import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true, replies: true } },
      likes: { where: { userId: auth.id }, select: { id: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { likes: true } },
          likes: { where: { userId: auth.id }, select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      liked: c.likes.length > 0,
      likes: undefined,
      likeCount: c._count.likes,
      replyCount: c._count.replies,
      _count: undefined,
      replies: c.replies.map((r) => ({
        ...r,
        liked: r.likes.length > 0,
        likes: undefined,
        likeCount: r._count.likes,
        _count: undefined,
      })),
    })),
  });
}

export async function POST(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { content, postId: params.id, authorId: auth.id },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json({ ...comment, liked: false, likeCount: 0, replyCount: 0, replies: [] });
}
