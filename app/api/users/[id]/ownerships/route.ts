import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownerships = await db.propertyOwner.findMany({
    where: { userId: (await params).id, isActive: true },
    include: { property: { select: { id: true, title: true, plotNumber: true, district: true, status: true } } },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(ownerships);
}
