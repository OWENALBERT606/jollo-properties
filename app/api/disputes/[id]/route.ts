import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status, resolution } = await req.json();
  const dispute = await db.dispute.update({
    where: { id: params.id },
    data: { status, resolution, resolvedAt: ["RESOLVED","DISMISSED"].includes(status) ? new Date() : undefined },
  });
  return NextResponse.json(dispute);
}
