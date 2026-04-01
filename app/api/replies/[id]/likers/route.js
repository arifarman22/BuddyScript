import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req, { params }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const likers = await prisma.replyLike.findMany({
    where: { replyId: params.id },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json({ likers: likers.map((l) => l.user) });
}
