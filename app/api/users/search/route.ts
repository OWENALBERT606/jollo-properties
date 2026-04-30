import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json([]);

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nin: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, nin: true, phone: true },
    take: 10,
  });

  return NextResponse.json(users);
}
