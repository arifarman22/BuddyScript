import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET(req) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

  const where = {
    OR: [{ visibility: "public" }, { authorId: auth.id }],
  };

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: auth.id }, select: { id: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { likes: true, replies: true } },
          likes: { where: { userId: auth.id }, select: { id: true } },
        },
      },
    },
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const nextCursor = hasMore ? posts[posts.length - 1]?.id : null;

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      liked: p.likes.length > 0,
      likes: undefined,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      _count: undefined,
      comments: p.comments.map((c) => ({
        ...c,
        liked: c.likes.length > 0,
        likes: undefined,
        likeCount: c._count.likes,
        replyCount: c._count.replies,
        _count: undefined,
      })),
    })),
    nextCursor,
  });
}

export async function POST(req) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const content = formData.get("content");
  const visibility = formData.get("visibility") || "public";
  const image = formData.get("image");

  if (!content && !image) {
    return NextResponse.json({ error: "Post must have content or image" }, { status: 400 });
  }

  let imageUrl = null;
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "buddyscript" },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer);
    });
    imageUrl = result.secure_url;
  }

  const post = await prisma.post.create({
    data: { content: content || "", imageUrl, visibility, authorId: auth.id },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({
    ...post,
    liked: false,
    likeCount: 0,
    commentCount: 0,
    comments: [],
    _count: undefined,
  });
}
